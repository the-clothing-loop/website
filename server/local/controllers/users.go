package controllers

import (
	"fmt"

	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

func UserGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UID      string `form:"user_uid" binding:"omitempty,uuid"`
		Email    string `form:"email" binding:"omitempty,email"`
		ChainUID string `form:"chain_uid" binding:"omitempty,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	// retrieve user from query
	if query.UID == "" && query.Email == "" {
		boom.BadRequest(c.Writer, "add uid or email to query")
		return
	}
	user := &models.User{}
	if query.UID != "" {
		db.Where("uid = ? AND is_email_verified = ?", query.UID, true).First(user)
	} else if query.Email != "" {
		db.Where("email = ? AND is_email_verified = ?", query.Email, true).First(user)
	}
	if user.ID == 0 {
		boom.BadRequest(c.Writer, "user not found")
		return
	}

	var ok bool
	if query.ChainUID == "" {
		ok, authUser, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")

		if ok && user.ID != authUser.ID {
			boom.Unathorized(c.Writer, "for elevated privileges include a chain_uid")
			return
		}
	} else {
		ok, _, _ = auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	}
	if !ok {
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
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, _, _ := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
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
		boom.Internal(c.Writer)
		return
	}
	err = tx.Raw(`
SELECT users.*
FROM users
LEFT JOIN user_chains ON user_chains.user_id = users.id 
LEFT JOIN chains      ON chains.id = user_chains.chain_id
WHERE chains.uid = ? AND users.is_email_verified = ?
	`, query.ChainUID, true).Scan(users).Error
	if err != nil {
		boom.Internal(c.Writer)
		return
	}
	tx.Commit()

	for i, user := range *users {
		thisUserChains := []models.UserChain{}
		for ii := range *allUserChains {
			userChain := (*allUserChains)[ii]
			if userChain.UserID == user.ID {
				// log.Printf("userchain is added (userChain.ID: %d -> user.ID: %d)\n", userChain.ID, user.ID)
				thisUserChains = append(thisUserChains, userChain)
			}
		}
		(*users)[i].Chains = thisUserChains
	}

	c.JSON(200, users)
}

func UserUpdate(c *gin.Context) {
	db := getDB(c)

	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	var body struct {
		Name        *string   `json:"name"`
		PhoneNumber *string   `json:"phone_number"`
		Newsletter  *bool     `json:"newsletter"`
		Sizes       *[]string `json:"sizes"`
		Address     *string   `json:"address"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}
	if body.Sizes != nil {
		if ok := models.ValidateAllSizeEnum(*body.Sizes); !ok {
			boom.BadRequest(c.Writer, "invalid size enum")
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
			userChanges["interested_sizes"] = *body.Sizes
		}
		if res := db.Model(user).Updates(userChanges); res.Error != nil {
			boom.Internal(c.Writer, res.Error)
			return
		}
	}

	if body.Newsletter != nil {
		if *body.Newsletter {
			res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.Newsletter{
				Email: user.Email,
				Name:  user.Name,
			})
			if res.Error != nil {
				boom.Internal(c.Writer)
				return
			}
		} else {
			res := db.Where("email = ?", user.Email).Delete(&models.Newsletter{})
			if res.Error != nil {
				boom.Internal(c.Writer)
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
		boom.BadRequest(c.Writer, fmt.Sprintf("err: %v, uri: %v", err, query))
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
		boom.BadRequest(c.Writer, "User is not found")
		return
	}

	db.Delete(&models.User{}, userID)
}
