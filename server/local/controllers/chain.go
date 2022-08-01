package controllers

import (
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/CollActionteam/clothing-loop/server/local/views"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func ChainCreate(c *gin.Context) {
	db := getDB(c)
	ok, user, _ := middlewareAuth(c, db, models.RoleUser, "")
	if !ok {
		return
	}

	var body struct {
		Name        string   `json:"name" binding:"required"`
		Description string   `json:"description" binding:"required"`
		Address     string   `json:"address" binding:"required"`
		Latitude    float32  `json:"latitude" binding:"required"`
		Longitude   float32  `json:"longitude" binding:"required"`
		Radius      float32  `json:"radius" binding:"required"`
		Genders     []string `json:"genders" binding:"required"`
		Sizes       []string `json:"sizes" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}
	if ok := models.ValidateAllGenderEnum(body.Genders); !ok {
		boom.BadRequest(c.Writer, "gender not a valid enum value")
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Sizes); !ok {
		boom.BadRequest(c.Writer, "size not a valid enum value")
		return
	}

	chainGenders := models.SetGendersFromList(body.Genders)
	chainSizes := models.SetSizesFromList(body.Sizes)

	chain := models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             body.Name,
		Description:      body.Description,
		Address:          body.Address,
		Latitude:         body.Latitude,
		Longitude:        body.Longitude,
		Radius:           body.Radius,
		Published:        true,
		OpenToNewMembers: true,
		Genders:          chainGenders,
		Sizes:            chainSizes,
		Users: []models.UserChain{
			{UserID: user.ID, ChainAdmin: true},
		},
	}
	db.Create(&chain)

	c.JSON(http.StatusOK, gin.H{})
}

func ChainGet(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID string `json:"chain_uid" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, _, _ := middlewareAuth(c, db, models.RoleUser, "")
	if !ok {
		return
	}

	chain := models.Chain{}
	if res := db.Raw(`
SELECT *
FROM chains
WHERE chains.uid = ?
LEFT JOIN chain_gender ON chain_gender.chain_id = chains.id
LIMIT 1
	`).Scan(&chain); res.Error != nil {
		boom.BadRequest(c.Writer, "chain not found")
		return
	}

	c.JSON(200, gin.H{
		"uid":              chain.UID,
		"name":             chain.Name,
		"description":      chain.Description,
		"address":          chain.Address,
		"latitude":         chain.Latitude,
		"longitude":        chain.Longitude,
		"radius":           chain.Radius,
		"genders":          chain.Genders,
		"published":        chain.Published,
		"openToNewMembers": chain.OpenToNewMembers,
	})
}

func ChainUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UID         string    `json:"uid" binding:"required"`
		Name        *string   `json:"name"`
		Description *string   `json:"description"`
		Address     *string   `json:"address"`
		Latitude    *float32  `json:"latitude"`
		Longitude   *float32  `json:"longitude"`
		Radius      *float32  `json:"radius"`
		Genders     *[]string `json:"genders"`
		Sizes       *[]string `json:"sizes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, _, chain := middlewareAuth(c, db, models.RoleChainAdmin, body.UID)
	if !ok {
		return
	}

	optionalValues := map[string]any{
		"name":        body.Name,
		"description": body.Description,
		"address":     body.Address,
		"latitude":    body.Latitude,
		"longitude":   body.Longitude,
		"radius":      body.Radius,
		"genders":     body.Genders,
		"sizes":       body.Sizes,
	}
	valuesToUpdate := map[string]any{}
	for k := range optionalValues {
		v := optionalValues[k]

		if v != nil {
			valuesToUpdate[k] = v
		}
	}

	if res := db.Model(chain).Updates(valuesToUpdate); res.Error != nil {
		boom.Internal(c.Writer)
	}
}

func ChainAddUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UserUID    string `json:"user_uid" binding:"required,uuid"`
		ChainUID   string `json:"chain_uid" binding:"required,uuid"`
		ChainAdmin bool   `json:"chain_admin"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, _, chain := middlewareAuth(c, db, models.RoleChainAdmin, body.ChainUID)
	if !ok {
		return
	}

	var user models.User
	if res := db.Where("uid = ? AND enabled = ? AND email_verified = ?", body.UserUID, true, true).First(&user); res.Error != nil {
		boom.BadRequest(c.Writer, "User does not exist")
		return
	}

	if !chain.OpenToNewMembers {
		boom.BadRequest(c.Writer, "This loop is not currently open to new members")
		return
	}

	if res := db.Where("user_id = ? AND chain_id = ?", user.ID, chain.ID).First(&models.UserChain{}); res.Error == nil {
		boom.BadRequest(c.Writer, "This user is already a member")
	}

	if res := db.Create(&models.UserChain{
		UserID:     user.ID,
		ChainID:    chain.ID,
		ChainAdmin: false,
	}); res.Error != nil {
		boom.Internal(c.Writer, "User could not be added to chain due to unknown error")
		return
	}

	var results []struct {
		Name  string
		Email string
	}
	db.Raw(`
SELECT users.name as name, users.email as email
FROM user_chains
JOIN users ON user_chains.user_id = users.id 
WHERE user_chains.chain_id = ?
	AND user_chains.chain_admin = ?
	AND users.enabled = ?
`, chain.ID, true, true).Scan(&results)

	if len(results) == 0 {
		boom.Internal(c.Writer, "No admins exist for this loop")
		return
	}

	for _, result := range results {
		go views.EmailAParticipantJoinedTheLoop(
			c,
			db,
			result.Email,
			result.Name,
			user.Name,
			user.Email,
			user.PhoneNumber,
		)
	}
}
