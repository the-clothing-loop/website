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

	userChainJSON, err := user.GetUserChainResponse(db)
	if err != nil {
		boom.Internal(c.Writer, err)
		return
	}

	c.JSON(200, gin.H{
		"uid":               user.UID,
		"email":             user.Email,
		"name":              user.Name,
		"phone_number":      user.PhoneNumber,
		"is_email_verified": user.IsEmailVerified,
		"chains":            userChainJSON,
		"address":           user.Address,
		"sizes":             user.Sizes,
		"is_root_admin":     user.IsRootAdmin,
	})
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
		for _, size := range *body.Sizes {
			if ok := models.ValidateSizeEnum(size); !ok {
				boom.BadRequest(c.Writer, "invalid size enum")
				return
			}
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
