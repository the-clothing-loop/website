package controllers

import (
	"net/http"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/guregu/null.v3/zero"
)

func LoginEmail(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Email string `binding:"required,email" json:"email"`
		IsApp bool   `json:"app"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, "Email required")
		return
	}

	// make sure that this email exists in db
	user, err := models.UserGetByEmail(db, body.Email)
	if err != nil {
		c.String(http.StatusUnauthorized, "Email is not yet registered")
		return
	}

	if body.Email == app.Config.APPSTORE_REVIEWER_EMAIL {
		_, err := auth.TokenCreateUnverifiedBackdoor(db, user.ID)
		if err != nil {
			c.String(http.StatusInternalServerError, "Unable to create token")
			return
		}
		return
	}

	token, err := auth.TokenCreateUnverified(db, user.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "Unable to create token")
		return
	}
	err = views.EmailLoginVerification(c, db, user.Name, user.Email.String, token, body.IsApp)
	if err != nil {
		glog.Errorf("Unable to send email: %v", err)
		c.String(http.StatusInternalServerError, "Unable to send email")
	}
}

func LoginValidate(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Key string `form:"apiKey,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, "Malformed url: apiKey required")
		return
	}
	token := query.Key

	ok, user, newToken := auth.TokenVerify(db, token)
	if !ok {
		c.String(http.StatusUnauthorized, "Invalid token")
		return
	}

	err := user.AddUserChainsToObject(db)
	if err != nil {
		goscope.Log.Errorf("%v: %v", models.ErrAddUserChainsToObject, err)
		c.String(http.StatusInternalServerError, models.ErrAddUserChainsToObject.Error())
		return
	}

	// email a participant joined the loop
	chainIDs := []uint{}
	for _, uc := range user.Chains {
		if !uc.IsChainAdmin {
			chainIDs = append(chainIDs, uc.ChainID)
		}
	}

	var results []struct {
		Name  string
		Email zero.String
		Chain string
		I18n  string
	}
	err = db.Raw(`
SELECT
 users.name AS name, 
 users.email AS email,
 chains.name AS chain,
 users.i18n AS i18n
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id 
LEFT JOIN chains ON chains.id = user_chains.chain_id
WHERE user_chains.chain_id IN ?
	AND user_chains.is_chain_admin = TRUE
	`, chainIDs).Scan(&results).Error
	if err != nil {
		goscope.Log.Errorf("Unable to find associated loop admins: %v", err)
		c.String(http.StatusInternalServerError, "Unable to find associated loop admins")
		return
	}

	// Is the first time verifying the user account
	if user.Email.Valid && !user.IsEmailVerified {
		db.Exec(`
UPDATE chains SET published = TRUE WHERE id IN (
	SELECT chain_id FROM user_chains WHERE user_id = ? AND is_chain_admin = TRUE
)
		`, user.ID)

		// Reset joined-at time
		db.Exec(`UPDATE user_chains SET created_at = NOW() WHERE user_id = ?`, user.ID)

		for _, result := range results {
			if result.Email.Valid {
				go views.EmailAParticipantJoinedTheLoop(c, db, result.I18n,
					result.Email.String,
					result.Name,
					result.Chain,
					user.Name,
					user.Email.String,
					user.PhoneNumber,
					user.Address,
					user.Sizes,
				)
			}
		}
	}
	// re-add IsEmailVerified, see TokenVerify
	user.IsEmailVerified = true

	// set token as cookie
	auth.CookieSet(c, newToken)
	c.JSON(200, gin.H{
		"user":  user,
		"token": newToken,
	})
}

// Sizes and Address is set to the user and the chain
func RegisterChainAdmin(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Chain ChainCreateRequestBody `json:"chain" binding:"required"`
		User  UserCreateRequestBody  `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		c.String(http.StatusBadRequest, models.ErrSizeInvalid.Error())
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Chain.Sizes); !ok {
		c.String(http.StatusBadRequest, models.ErrSizeInvalid.Error())
		return
	}

	if ok := models.ValidateAllGenderEnum(body.Chain.Genders); !ok {
		c.String(http.StatusBadRequest, models.ErrGenderInvalid.Error())
		return
	}

	if !body.User.Newsletter {
		c.String(http.StatusBadRequest, "Newsletter-Box must be checked to create a new loop admin.")
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
		Published:        false,
		OpenToNewMembers: body.Chain.OpenToNewMembers,
		CountryCode:      body.Chain.CountryCode,
		Sizes:            body.Chain.Sizes,
		Genders:          body.Chain.Genders,
	}
	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(body.User.Email),
		IsEmailVerified: false,
		IsRootAdmin:     false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		Sizes:           body.User.Sizes,
		Address:         body.User.Address,
		Latitude:        body.User.Latitude,
		Longitude:       body.User.Longitude,
	}
	if err := db.Create(user).Error; err != nil {
		goscope.Log.Warningf("User already exists: %v", err)
		c.String(http.StatusConflict, "User already exists")
		return
	}
	chain.UserChains = []models.UserChain{{
		UserID:       user.ID,
		IsChainAdmin: true,
		IsApproved:   true,
	}}
	db.Create(chain)

	db.Create(&models.Newsletter{
		Email:    body.User.Email,
		Name:     body.User.Name,
		Verified: false,
	})

	token, err := auth.TokenCreateUnverified(db, user.ID)
	if err != nil {
		goscope.Log.Errorf("Unable to create token: %v", err)
		c.String(http.StatusInternalServerError, "Unable to create token")
		return
	}

	go views.EmailRegisterVerification(c, db, user.Name, user.Email.String, token)
}

func RegisterOrphanedUser(c *gin.Context) {
	db := getDB(c)
	var body struct {
		User UserCreateRequestBody `json:"user" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		c.String(http.StatusBadRequest, models.ErrSizeInvalid.Error())
		return
	}

	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(body.User.Email),
		IsEmailVerified: false,
		IsRootAdmin:     false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		Sizes:           body.User.Sizes,
		Address:         body.User.Address,
		Latitude:        body.User.Latitude,
		Longitude:       body.User.Longitude,
	}

	if res := db.Create(user); res.Error != nil {
		goscope.Log.Warningf("User already exists: %v", res.Error)
		c.String(http.StatusConflict, "User already exists")
		return
	}

	if body.User.Newsletter {
		n := &models.Newsletter{
			Email:    body.User.Email,
			Name:     body.User.Name,
			Verified: false,
		}
		n.CreateOrUpdate(db)
	}

	token, err := auth.TokenCreateUnverified(db, user.ID)
	if err != nil {
		goscope.Log.Errorf("Unable to create token: %v", err)
		c.String(http.StatusInternalServerError, "Unable to create token")
		return
	}
	views.EmailRegisterVerification(c, user.Name, user.Email.String, token)
}

func RegisterBasicUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID string                `json:"chain_uid" binding:"uuid,required"`
		User     UserCreateRequestBody `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		c.String(http.StatusBadRequest, models.ErrSizeInvalid.Error())
		return
	}

	var chainID uint
	{
		var row struct {
			ID uint `gorm:"id"`
		}
		err := db.Raw("SELECT id FROM chains WHERE uid = ? AND deleted_at IS NULL AND open_to_new_members = TRUE LIMIT 1", body.ChainUID).Scan(&row).Error
		chainID = row.ID
		if chainID == 0 {
			goscope.Log.Warningf("Chain does not exist: %v", err)
			c.String(http.StatusBadRequest, "Chain does not exist")
			return
		}
	}

	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(body.User.Email),
		IsEmailVerified: false,
		IsRootAdmin:     false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		Sizes:           body.User.Sizes,
		Address:         body.User.Address,
		Latitude:        body.User.Latitude,
		Longitude:       body.User.Longitude,
	}
	if res := db.Create(user); res.Error != nil {
		goscope.Log.Warningf("User already exists: %v", res.Error)
		c.String(http.StatusConflict, "User already exists")
		return
	}
	db.Create(&models.UserChain{
		UserID:       user.ID,
		ChainID:      chainID,
		IsChainAdmin: false,
		IsApproved:   false,
	})
	if body.User.Newsletter {
		n := &models.Newsletter{
			Email:    body.User.Email,
			Name:     body.User.Name,
			Verified: false,
		}
		n.CreateOrUpdate(db)
	}

	token, err := auth.TokenCreateUnverified(db, user.ID)
	if err != nil {
		goscope.Log.Errorf("Unable to create token: %v", err)
		c.String(http.StatusInternalServerError, "Unable to create token")
		return
	}
	views.EmailRegisterVerification(c, db, user.Name, user.Email.String, token)
}

func Logout(c *gin.Context) {
	db := getDB(c)

	token, ok := auth.TokenReadFromRequest(c)
	if !ok {
		c.String(http.StatusBadRequest, "No token received")
		return
	}

	auth.TokenDelete(db, token)
	auth.CookieRemove(c)
}
