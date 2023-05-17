package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3/zero"

	"github.com/gin-gonic/gin"
)

type UserCreateRequestBody struct {
	Email       string   `json:"email" binding:"required,email"`
	Name        string   `json:"name" binding:"required,min=3"`
	Address     string   `json:"address" binding:"required,min=3"`
	PhoneNumber string   `json:"phone_number" binding:"required,min=3"`
	Newsletter  bool     `json:"newsletter"`
	Sizes       []string `json:"sizes"`
}

func UserGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UserUID  string `form:"user_uid" binding:"omitempty,uuid"`
		ChainUID string `form:"chain_uid" binding:"omitempty,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	// retrieve user from query
	if query.UserUID == "" {
		c.String(http.StatusBadRequest, "Add uid or email to query")
		return
	}

	ok := false
	if query.ChainUID == "" {
		okk, authUser, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
		ok = okk

		if !ok || query.UserUID != authUser.UID {
			c.String(http.StatusUnauthorized, "For elevated privileges include a chain_uid")
			return
		}
	} else {
		ok, _, _ = auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	}
	if !ok {
		return
	}

	user := &models.User{}
	if query.UserUID != "" {
		db.Raw(`
SELECT users.*
FROM users
WHERE users.uid = ? AND is_email_verified = TRUE
LIMIT 1
		`, query.UserUID).First(user)
	}
	if user.ID == 0 {
		c.String(http.StatusBadRequest, "User not found")
		return
	}

	err := user.AddUserChainsToObject(db)
	if err != nil {
		goscope.Log.Errorf("%v: %v", models.ErrAddUserChainsToObject, err)
		c.String(http.StatusInternalServerError, models.ErrAddUserChainsToObject.Error())
		return
	}

	c.JSON(200, user)
}

func UserGetAllOfChain(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, authUser, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	_, isAuthUserChainAdmin := authUser.IsPartOfChain(chain.UID)
	isAuthState3AdminChainUser := isAuthUserChainAdmin || authUser.IsRootAdmin

	// retrieve user from query
	users := &[]models.User{}
	allUserChains := &[]models.UserChain{}

	tx := db.Begin()
	err := tx.Raw(`
SELECT
	user_chains.id             AS id,
	user_chains.chain_id       AS chain_id,
	chains.uid                 AS chain_uid,
	user_chains.user_id        AS user_id,
	users.uid                  AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin,
	user_chains.created_at     AS created_at,
	user_chains.is_approved    AS is_approved
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON user_chains.user_id = users.id
WHERE users.id IN (
	SELECT user_chains.user_id
	FROM user_chains
	LEFT JOIN chains ON chains.id = user_chains.chain_id
	WHERE chains.id = ?
)
	`, chain.ID).Scan(allUserChains).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve associations between a loop and its users: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve associations between a loop and its users")
		return
	}
	err = tx.Raw(`
SELECT users.*
FROM users
LEFT JOIN user_chains ON user_chains.user_id = users.id 
LEFT JOIN chains      ON chains.id = user_chains.chain_id
WHERE chains.id = ? AND users.is_email_verified = TRUE
	`, chain.ID).Scan(users).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve associated users of a loop: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve associated users of a loop")
		return
	}
	tx.Commit()

	for i, user := range *users {
		thisUserChains := []models.UserChain{}
		for ii := range *allUserChains {
			userChain := (*allUserChains)[ii]
			if userChain.UserID == user.ID {
				// goscope.Log.Infof("userchain is added (userChain.ID: %d -> user.ID: %d)\n", userChain.ID, user.ID)
				thisUserChains = append(thisUserChains, userChain)
			}
		}
		(*users)[i].Chains = thisUserChains
	}

	// omit user data from participants
	if isAuthState3AdminChainUser {
		route, err := chain.GetRouteOrderByUserUID(db)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		authUserRouteOrder := routeIndex(route, authUser.UID)
		for i, user := range *users {
			// find users above and below this user in the route order
			routeOrder := routeIndex(route, user.UID)
			_, isChainAdmin := user.IsPartOfChain(chain.UID)

			isDirectlyBeforeOrAfter := authUserRouteOrder-1 <= routeOrder && routeOrder >= 1+authUserRouteOrder
			if !isDirectlyBeforeOrAfter && authUser.UID != user.UID {
				if !isChainAdmin {
					(*users)[i].Email = zero.StringFrom("***")
					(*users)[i].PhoneNumber = "***"
				}
				(*users)[i].Address = "***"
			}
		}
	}

	c.JSON(200, users)
}

func UserHasNewsletter(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"omitempty,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, _, _ := auth.AuthenticateUserOfChain(c, db, query.ChainUID, query.UserUID)
	if !ok {
		return
	}

	hasNewsletter := 0
	db.Raw(`SELECT COUNT(*) FROM newsletters WHERE email = ? LIMIT 1`, user.Email.String).Scan(&hasNewsletter)

	c.JSON(200, hasNewsletter > 0)
}

func UserUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID    string    `json:"chain_uid,omitempty" binding:"omitempty,uuid"`
		UserUID     string    `json:"user_uid,omitempty" binding:"uuid"`
		Name        *string   `json:"name,omitempty"`
		PhoneNumber *string   `json:"phone_number,omitempty"`
		Newsletter  *bool     `json:"newsletter,omitempty"`
		Sizes       *[]string `json:"sizes,omitempty"`
		Address     *string   `json:"address,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, _, _ := auth.AuthenticateUserOfChain(c, db, body.ChainUID, body.UserUID)
	if !ok {
		return
	}
	isAnyChainAdmin := user.IsAnyChainAdmin()

	if body.Sizes != nil {
		if ok := models.ValidateAllSizeEnum(*body.Sizes); !ok {
			c.String(http.StatusBadRequest, "Invalid size enum")
			return
		}
	}

	userChanges := map[string]interface{}{}
	if body.Name != nil || body.PhoneNumber != nil || body.Address != nil {
		if body.Name != nil {
			userChanges["name"] = *body.Name
		}
		if body.PhoneNumber != nil {
			userChanges["phone_number"] = *body.PhoneNumber
		}
		if body.Address != nil {
			userChanges["address"] = *body.Address
		}
		if body.Sizes != nil {
			j, _ := json.Marshal(body.Sizes)
			userChanges["sizes"] = string(j)
		}
		if err := db.Model(user).Updates(userChanges).Error; err != nil {
			goscope.Log.Errorf("Unable to update user: %v", err)
			c.String(http.StatusInternalServerError, "Unable to update user")
			return
		}
	}

	if body.Newsletter != nil {
		if *body.Newsletter {
			n := &models.Newsletter{
				Email:    user.Email.String,
				Name:     user.Name,
				Verified: true,
			}

			err := n.CreateOrUpdate(db)
			if err != nil {
				goscope.Log.Errorf("%v", err)
				c.String(http.StatusInternalServerError, "Internal Server Error")
				return
			}
		} else {
			if isAnyChainAdmin {
				c.String(http.StatusConflict, "Newsletter-Box must be checked to create a new loop admin.")
				return
			}

			err := db.Exec("DELETE FROM newsletters WHERE email = ?", user.Email).Error
			if err != nil {
				goscope.Log.Errorf("%v", err)
				c.String(http.StatusInternalServerError, "Internal Server Error")
				return
			}
			if app.SendInBlue != nil && user.Email.Valid {
				app.SendInBlue.DeleteContact(c.Request.Context(), user.Email.String)
			}
		}
	}
}

func UserDelete(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, _ := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

	// first find user id
	var userID uint
	db.Raw("SELECT id FROM users WHERE uid = ? LIMIT 1", query.UserUID).Scan(&userID)
	if userID == 0 {
		c.String(http.StatusBadRequest, "User is not found")
		return
	}

	db.Delete(&models.User{}, userID)
}

func UserPurge(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UserUID string `form:"user_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, _, _ := auth.AuthenticateUserOfChain(c, db, "", query.UserUID)
	if !ok {
		return
	}

	// find chains where user is the last chain admin
	chainIDsToDelete := []uint{}
	db.Raw(`
SELECT uc.chain_id 
FROM  user_chains AS uc
WHERE uc.chain_id IN (
	SELECT uc2.chain_id
	FROM user_chains AS uc2
	WHERE uc2.is_chain_admin = TRUE AND uc2.user_id = ?
)
GROUP BY uc.chain_id 
HAVING COUNT(uc.id) = 1
	`, user.ID).Scan(&chainIDsToDelete)

	tx := db.Begin()

	err := user.DeleteUserChainDependenciesAllChains(tx)
	if err != nil {
		tx.Rollback()
		goscope.Log.Errorf("UserPurge: %v", err)
		c.String(http.StatusInternalServerError, "Unable to disconnect bag connections")
		return
	}
	err = tx.Exec(`DELETE FROM user_chains WHERE user_id = ?`, user.ID).Error
	if err != nil {
		tx.Rollback()
		goscope.Log.Errorf("UserPurge: Unable to remove loop connections: %v", err)
		c.String(http.StatusInternalServerError, "Unable to remove loop connections")
		return
	}
	err = tx.Exec(`DELETE FROM user_tokens WHERE user_id = ?`, user.ID).Error
	if err != nil {
		tx.Rollback()
		goscope.Log.Errorf("UserPurge: Unable to remove token connections: %v", err)
		c.String(http.StatusInternalServerError, "Unable to remove token connections")
		return
	}
	err = tx.Exec(`DELETE FROM users WHERE id = ?`, user.ID).Error
	if err != nil {
		tx.Rollback()
		goscope.Log.Errorf("UserPurge: Unable to user: %v", err)
		c.String(http.StatusInternalServerError, "Unable to user")
		return
	}

	if len(chainIDsToDelete) > 0 {
		err := tx.Exec(`DELETE FROM bags WHERE user_chain_id IN (
			SELECT id FROM user_chains WHERE chain_id IN ?
		)`, chainIDsToDelete).Error
		if err != nil {
			tx.Rollback()
			goscope.Log.Errorf("UserPurge: %v", err)
			c.String(http.StatusInternalServerError, "Unable to disconnect all loop bag connections")
			return
		}
		err = tx.Exec(`DELETE FROM user_chains WHERE chain_id IN ?`, chainIDsToDelete).Error
		if err != nil {
			tx.Rollback()
			goscope.Log.Errorf("UserPurge: Unable to remove hosted loop connections: %v", err)
			c.String(http.StatusInternalServerError, "Unable to remove hosted loop connections")
			return
		}
		err = tx.Exec(`DELETE FROM chains WHERE id IN ?`, chainIDsToDelete).Error
		if err != nil {
			tx.Rollback()
			goscope.Log.Errorf("UserPurge: Unable to remove hosted loop: %v", err)
			c.String(http.StatusInternalServerError, "Unable to remove hosted loop")
			return
		}
	}

	if user.Email.Valid {
		err = tx.Exec(`DELETE FROM newsletters WHERE email = ?`, user.Email.String).Error
		if err != nil {
			tx.Rollback()
			goscope.Log.Errorf("UserPurge: Unable to remove newsletter: %v", err)
			c.String(http.StatusInternalServerError, "Unable to remove newsletter")
			return
		}
		if app.SendInBlue != nil {
			app.SendInBlue.DeleteContact(c.Request.Context(), user.Email.String)
		}
	}

	tx.Commit()
}

func routeIndex(route []string, userUID string) int {
	for i, uid := range route {
		if uid == userUID {
			return i
		}
	}
	return -1
}
