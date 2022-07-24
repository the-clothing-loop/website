package controllers

import (
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm/clause"
)

func UserGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		UID      string `query:"uid" binding:"uuid"`
		Email    string `query:"email" binding:"email"`
		ChainUID string `query:"chain_uid" binding:"uuid,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	if query.UID == "" && query.Email == "" {
		boom.BadRequest(c.Writer, "add uid or email to query")
		return
	}

	ok, authUser, chain := middlewareAuthCookieStart(c, db, models.RoleUser, query.ChainUID)
	if !ok {
		return
	}

	var user *models.User
	if query.UID != "" {
		db.Where("uid = ? AND email_verified = ?", query.UID, true).First(user)
	} else if query.Email != "" {
		db.Where("email = ? AND email_verified = ?", query.Email, true).First(user)
	}
	if user == nil {
		boom.BadRequest(c.Writer, "user not found")
		return
	}

	if ok := user.IsPartOfChain(db, chain.ID); !ok {
		boom.Unathorized(c.Writer)
		return
	}

	userChainLLJSON, err := user.GetUserChainLLJSON(db)
	if err != nil {
		boom.Internal(c.Writer, err)
		return
	}

	if ok := middlewareAuthCookieEnd(c, db, authUser); !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uid":              user.UID,
		"email":            user.Email,
		"name":             user.Name,
		"phone_number":     user.PhoneNumber,
		"email_verified":   user.EmailVerified,
		"chains":           userChainLLJSON,
		"address":          user.Address,
		"interested_sizes": user.InterestedSizes,
		"is_admin":         user.Admin,
	})
}

func UserUpdate(c *gin.Context) {
	db := getDB(c)

	ok, user, _ := middlewareAuthCookieStart(c, db, models.RoleUser, "")
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

	middlewareAuthCookieEnd(c, db, user)
}

func UserCreate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Email           string   `json:"email" binding:"required"`
		ChainUIDs       []string `json:"chain_uids" binding:"required"`
		Name            string   `json:"name" binding:"required"`
		PhoneNumber     string   `json:"phone_number" binding:"required"`
		Newsletter      bool     `json:"newsletter" binding:"required"`
		InterestedSizes []string `json:"interested_sizes" binding:"required"`
		Address         string   `json:"address" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer)
	}
	for _, size := range body.InterestedSizes {
		if ok := models.ValidateSizeEnum(size); !ok {
			boom.BadRequest(c.Writer, fmt.Sprintf("invalid size: %s", size))
			return
		}
	}

	var chains []struct {
		ID uint
	}
	// set user to chain
	db.Distinct("id").Where("uid in ?", body.ChainUIDs).Scan(&chains)
	// db.Update()

	user := models.User{
		UID:             uuid.NewV4().String(),
		Email:           body.Email,
		EmailVerified:   false,
		Admin:           false,
		Name:            body.Name,
		PhoneNumber:     body.PhoneNumber,
		InterestedSizes: body.InterestedSizes,
		Address:         body.Address,
		Enabled:         false,
	}
	db.Create(&user)

	userChainLL := []models.UserChainLL{}
	for _, chain := range chains {
		userChainLL = append(userChainLL, models.UserChainLL{
			UserID:  user.ID,
			ChainID: chain.ID,
		})
	}
	db.Create(&userChainLL)
}

func UserAddAsChainAdmin(c *gin.Context) {
	db := getDB(c)

	ok, authUser, _ := middlewareAuthCookieStart(c, db, models.RoleAdmin, "")
	if !ok {
		return
	}

	var body struct {
		UserUID  string `json:"user_uid" binding:"required,uuid"`
		ChainUID string `json:"chain_uid" binding:"required,uuid"`
	}
	if err := c.BindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "Add user_uid and chain_uid to body")
		return
	}

	userID := ""
	db.Raw(`
	SELECT id
	FROM users
	WHERE uid = ?
	LIMIT 1
	`, body.UserUID).Scan(userID)
	db.Raw(`
	UPDATE user_chain_lls
	SET ( chain_admin = ? )
	WHERE user_id = ?
	`, true, userID)

	middlewareAuthCookieEnd(c, db, authUser)
}
