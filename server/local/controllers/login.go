package controllers

import (
	"fmt"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	boom "github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

func LoginEmailStep1(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Email string `binding:"required,email" json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "email required in json")
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
		boom.Unathorized(c.Writer, "email is not yet registered")
		return
	}

	sendVerificationEmail(c, db, &user)
}

func sendVerificationEmail(c *gin.Context, db *gorm.DB, user *models.User) bool {
	token, ok := auth.TokenCreateUnverified(db, user.ID)
	if !ok {
		boom.Internal(c.Writer, "unable to create token")
		return false
	}

	subject := "Verify e-mail for clothing chain"
	messageHtml := fmt.Sprintf(`Hi %s,<br><br>Click <a href="%s/login/validate?apiKey=%s">here</a> to verify your e-mail and activate your clothing-loop account.<br><br>Regards,<br>The clothing-loop team!`, user.Name, app.Config.SITE_BASE_URL, token)

	// email user with token
	return app.MailSend(c, db, user.Email, subject, messageHtml)
}

func LoginEmailStep2(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Key string `uri:"apiKey,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		boom.BadRequest(c.Writer, "apiKey required")
		return
	}
	token := query.Key

	ok := auth.TokenVerify(db, token)
	if !ok {
		boom.Unathorized(c.Writer)
		return
	}

	auth.CookieSet(c, token)
}

// Sizes and Address is set to the user and the chain
func RegisterChainAdmin(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Address string   `json:"address"`
		Sizes   []string `json:"sizes"`
		Chain   struct {
			Name             string   `json:"name"`
			Description      string   `json:"description"`
			Latitude         float32  `json:"latitude"`
			Longitude        float32  `json:"longitude"`
			Radius           float32  `json:"radius"`
			OpenToNewMembers bool     `json:"open_to_new_members"`
			Genders          []string `json:"genders"`
		} `json:"chain" binding:"required"`
		User struct {
			Email       string `json:"email" binding:"required"`
			Name        string `json:"name" binding:"required"`
			PhoneNumber string `json:"phone_number"`
			Newsletter  bool   `json:"newsletter"`
		} `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Sizes); !ok {
		boom.BadRequest(c.Writer, fmt.Sprintf("invalid size in: %v", body.Sizes))
		return
	}
	if ok := models.ValidateAllGenderEnum(body.Chain.Genders); !ok {
		boom.BadRequest(c.Writer, fmt.Sprintf("invalid gender in: %v", body.Chain.Genders))
		return
	}

	genderTables := models.SetGendersFromList(body.Chain.Genders)
	sizeTables := models.SetSizesFromList(body.Sizes)

	chain := &models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             body.Chain.Name,
		Description:      body.Chain.Description,
		Address:          body.Address,
		Latitude:         body.Chain.Latitude,
		Longitude:        body.Chain.Longitude,
		Radius:           body.Chain.Radius,
		OpenToNewMembers: body.Chain.OpenToNewMembers,
		Genders:          genderTables,
		Sizes:            sizeTables,
	}
	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           body.User.Email,
		EmailVerified:   false,
		Admin:           false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		InterestedSizes: body.Sizes,
		Address:         body.Address,
		Enabled:         false,
	}
	if res := db.Create(user); res.Error != nil {
		boom.Conflict(c.Writer, "User already exists")
		return
	}
	chain.Users = []models.UserChain{{
		UserID:     user.ID,
		ChainAdmin: true,
	}}
	db.Create(chain)

	sendVerificationEmail(c, db, user)
}

func RegisterBasicUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID string `json:"chain_uid" binding:"uuid,required"`
		User     struct {
			Email       string   `json:"email" binding:"required"`
			Name        string   `json:"name" binding:"required"`
			Address     string   `json:"address"`
			PhoneNumber string   `json:"phone_number" binding:"required"`
			Newsletter  bool     `json:"newsletter" binding:"required"`
			Sizes       []string `json:"sizes"`
		} `json:"user" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.User.Sizes); !ok {
		boom.BadRequest(c.Writer, fmt.Sprintf("invalid size in: %v", body.User.Sizes))
		return
	}

	var chainID uint
	db.Raw("SELECT id FROM chain WHERE uid = ? LIMIT 1", body.ChainUID).Scan(&chainID)
	if chainID == 0 {
		boom.BadData(c.Writer, "chain_uid does not exist")
		return
	}

	user := &models.User{
		UID:             uuid.NewV4().String(),
		Email:           body.User.Email,
		EmailVerified:   false,
		Admin:           false,
		Name:            body.User.Name,
		PhoneNumber:     body.User.PhoneNumber,
		InterestedSizes: body.User.Sizes,
		Address:         body.User.Address,
		Enabled:         false,
	}
	db.Create(user)
	db.Create(&models.UserChain{
		UserID:     user.ID,
		ChainID:    chainID,
		ChainAdmin: false,
	})

	sendVerificationEmail(c, db, user)
}

func Logout(c *gin.Context) {
	db := getDB(c)

	token, ok := auth.TokenReadFromRequest(c, db)
	if !ok {
		boom.BadRequest(c.Writer, "no token received")
		return
	}

	auth.TokenDelete(db, token)
	auth.CookieRemove(c)
}
