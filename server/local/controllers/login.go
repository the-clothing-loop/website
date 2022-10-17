package controllers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func LoginEmail(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Email string `binding:"required,email" json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Email required"))
		return
	}

	// make sure that this email exists in db
	user := models.User{}
	res := db.Raw(`
SELECT *
FROM users
WHERE email = ?
LIMIT 1
	`, body.Email).Scan(&user)
	if res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Email is not yet registered"))
		return
	}

	sendVerificationEmail(c, db, &user)
}

func sendVerificationEmail(c *gin.Context, db *gorm.DB, user *models.User) bool {
	token, ok := auth.TokenCreateUnverified(db, user.ID)
	if !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to create token"))
		return false
	}

	subject := "Verify e-mail for clothing chain"
	messageHtml := fmt.Sprintf(`Hi %s,<br><br>Click <a href="%s/users/login/validate?apiKey=%s">here</a> to verify your e-mail and activate your clothing-loop account.<br><br>Regards,<br>The clothing-loop team!`, user.Name, app.Config.SITE_BASE_URL_FE, token)

	// email user with token
	return app.MailSend(c, db, user.Email, subject, messageHtml)
}

func LoginValidate(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Key string `form:"apiKey,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Malformed url: apiKey required"))
		return
	}
	token := query.Key

	ok := auth.TokenVerify(db, token)
	if !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Invalid token"))
		return
	}

	// get user
	user := &models.User{}
	err := db.Raw(`
SELECT users.*
FROM users
LEFT JOIN user_tokens ON user_tokens.user_id = users.id
WHERE user_tokens.token = ?
LIMIT 1
	`, token).First(user).Error
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
		return
	}

	err = user.AddUserChainsToObject(db)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
		return
	}

	// set token as cookie
	auth.CookieSet(c, token)
	c.JSON(200, user)
}

// Sizes and Address is set to the user and the chain
func RegisterChainAdmin(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Chain ChainCreateRequestBody `json:"chain" binding:"required"`
		User  UserCreateRequestBody  `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Chain.Sizes); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
		return
	}

	if ok := models.ValidateAllGenderEnum(body.Chain.Genders); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
		return
	}

	chain := &models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             body.Chain.Name,
		Description:      body.Chain.Description,
		Address:          body.Chain.Address,
		Latitude:         body.Chain.Latitude,
		Longitude:        body.Chain.Longitude,
		Radius:           body.Chain.Radius,
		Published:        true,
		OpenToNewMembers: body.Chain.OpenToNewMembers,
		Sizes:            body.Chain.Sizes,
		Genders:          body.Chain.Genders,
	}
	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           body.User.Email,
		IsEmailVerified: false,
		IsRootAdmin:     false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		Sizes:           body.User.Sizes,
		Address:         body.User.Address,
		Enabled:         false,
	}
	if res := db.Create(user); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusConflict, errors.New("User already exists"))
		return
	}
	chain.UserChains = []models.UserChain{{
		UserID:       user.ID,
		IsChainAdmin: true,
	}}
	db.Create(chain)
	if body.User.Newsletter {
		db.Create(&models.Newsletter{
			Email:    body.User.Email,
			Name:     body.User.Name,
			Verified: false,
		})
	}

	sendVerificationEmail(c, db, user)
}

func RegisterBasicUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID string                `json:"chain_uid" binding:"uuid,required"`
		User     UserCreateRequestBody `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
		return
	}

	var chainID uint
	{
		var row struct {
			ID uint `gorm:"id"`
		}
		db.Raw("SELECT id FROM chains WHERE uid = ? AND deleted_at IS NULL LIMIT 1", body.ChainUID).Scan(&row)
		chainID = row.ID
		if chainID == 0 {
			gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Chain does not exist"))
			return
		}
	}

	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           body.User.Email,
		IsEmailVerified: false,
		IsRootAdmin:     false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		Sizes:           body.User.Sizes,
		Address:         body.User.Address,
		Enabled:         false,
	}
	if res := db.Create(user); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusConflict, errors.New("User already exists"))
		return
	}
	db.Create(&models.UserChain{
		UserID:       user.ID,
		ChainID:      chainID,
		IsChainAdmin: false,
	})
	if body.User.Newsletter {
		db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.Newsletter{
			Email:    body.User.Email,
			Name:     body.User.Name,
			Verified: false,
		})
	}

	sendVerificationEmail(c, db, user)
}

func Logout(c *gin.Context) {
	db := getDB(c)

	token, ok := auth.TokenReadFromRequest(c)
	if !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("No token received"))
		return
	}

	auth.TokenDelete(db, token)
	auth.CookieRemove(c)
}
