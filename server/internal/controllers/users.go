package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	glog "github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
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
		Email    string `form:"email" binding:"omitempty,email"`
		ChainUID string `form:"chain_uid" binding:"omitempty,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	// retrieve user from query
	if query.UserUID == "" && query.Email == "" {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Add uid or email to query"))
		return
	}

	ok := false
	if query.ChainUID == "" {
		okk, authUser, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
		ok = okk

		if ok && !(query.UserUID == authUser.UID || query.Email == authUser.Email.String) {
			gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("For elevated privileges include a chain_uid"))
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
	} else if query.Email != "" {
		db.Raw(`
SELECT users.*
FROM users
WHERE users.email = ? AND is_email_verified = TRUE
LIMIT 1
		`, query.Email).First(user)
	}
	if user.ID == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("User not found"))
		return
	}

	err := user.AddUserChainsToObject(db)
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, models.ErrAddUserChainsToObject)
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, _, _ := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

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
	user_chains.is_chain_admin AS is_chain_admin
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON user_chains.user_id = users.id
WHERE users.id IN (
	SELECT user_chains.user_id
	FROM user_chains
	LEFT JOIN chains ON chains.id = user_chains.chain_id
	WHERE chains.uid = ?
)
	`, query.ChainUID).Scan(allUserChains).Error
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to retrieve associated users of loop"))
		return
	}
	err = tx.Raw(`
SELECT users.*
FROM users
LEFT JOIN user_chains ON user_chains.user_id = users.id 
LEFT JOIN chains      ON chains.id = user_chains.chain_id
WHERE chains.uid = ? AND users.is_email_verified = TRUE
	`, query.ChainUID).Scan(users).Error
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to retrieve associated loops of the users of a loop"))
		return
	}
	tx.Commit()

	for i, user := range *users {
		thisUserChains := []models.UserChain{}
		for ii := range *allUserChains {
			userChain := (*allUserChains)[ii]
			if userChain.UserID == user.ID {
				// glog.Infof("userchain is added (userChain.ID: %d -> user.ID: %d)\n", userChain.ID, user.ID)
				thisUserChains = append(thisUserChains, userChain)
			}
		}
		(*users)[i].Chains = thisUserChains
	}

	c.JSON(200, users)
}

func UserHasNewsletter(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UserUID string `form:"user_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, user, _, _ := auth.AuthenticateUserOfChain(c, db, "", query.UserUID)
	if !ok {
		return
	}

	hasNewsletter := 0
	db.Raw(`SELECT COUNT(*) FROM newsletters WHERE email = ? LIMIT 1`, user.Email.String).Scan(&hasNewsletter)

	c.JSON(200, gin.H{"has_newsletter": hasNewsletter > 0})
}

func UserUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID    string    `json:"chain_uid,omitempty" binding:"uuid"`
		UserUID     string    `json:"user_uid,omitempty" binding:"uuid"`
		Name        *string   `json:"name,omitempty"`
		PhoneNumber *string   `json:"phone_number,omitempty"`
		Newsletter  *bool     `json:"newsletter,omitempty"`
		Sizes       *[]string `json:"sizes,omitempty"`
		Address     *string   `json:"address,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, user, _, _ := auth.AuthenticateUserOfChain(c, db, body.ChainUID, body.UserUID)
	if !ok {
		return
	}

	if body.Sizes != nil {
		if ok := models.ValidateAllSizeEnum(*body.Sizes); !ok {
			gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Invalid size enum"))
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
		if res := db.Model(user).Updates(userChanges); res.Error != nil {
			gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, res.Error)
			return
		}
	}

	if body.Newsletter != nil {
		if *body.Newsletter {
			res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.Newsletter{
				Email: user.Email.String,
				Name:  user.Name,
			})
			if res.Error != nil {
				glog.Error(res.Error)
				gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
				return
			}
		} else {
			res := db.Where("email = ?", user.Email).Delete(&models.Newsletter{})
			if res.Error != nil {
				glog.Error(res.Error)
				gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
				return
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("err: %v, uri: %v", err, query))
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("User is not found"))
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("err: %v, uri: %v", err, query))
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
GROUP BY uc.chain_id 
HAVING COUNT(uc.id) = 1 AND uc.chain_id IN (
	SELECT uc2.chain_id
	FROM user_chains AS uc2
	WHERE uc2.is_chain_admin = TRUE AND uc2.user_id = ?
)
	`, user.ID).Scan(&chainIDsToDelete)

	tx := db.Begin()
	tx.Exec(`DELETE FROM user_chains WHERE user_id = ?`, user.ID)
	tx.Exec(`DELETE FROM user_tokens WHERE user_id = ?`, user.ID)
	tx.Exec(`DELETE FROM users WHERE id = ?`, user.ID)
	if len(chainIDsToDelete) > 0 {
		tx.Exec(`DElETE FROM chains WHERE id IN ?`, chainIDsToDelete)
	}

	if user.Email.Valid {
		tx.Exec(`DELETE FROM newsletters WHERE email = ?`, user.Email.String)
	}
	tx.Commit()
}
