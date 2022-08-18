package controllers

import (
	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/CollActionteam/clothing-loop/server/local/views"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

type ChainCreateRequestBody struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Address     string   `json:"address" binding:"required"`
	Latitude    float64  `json:"latitude" binding:"required"`
	Longitude   float64  `json:"longitude" binding:"required"`
	Radius      float32  `json:"radius" binding:"required"`
	Sizes       []string `json:"sizes" binding:"required"`
}

func ChainCreate(c *gin.Context) {
	db := getDB(c)
	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	var body ChainCreateRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Sizes); !ok {
		boom.BadRequest(c.Writer, "size not a valid enum value")
		return
	}
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
		ChainSizes:       chainSizes,
		UserChains: []models.UserChain{
			{UserID: user.ID, IsChainAdmin: true},
		},
	}
	if res := db.Create(&chain); res.Error != nil {
		boom.Internal(c.Writer, "unable to create chain")
		return
	}

	c.Status(200)
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

	ok, _, _ := auth.Authenticate(c, db, models.RoleUser, "")
	if !ok {
		return
	}

	chain := models.Chain{}
	if res := db.Preload("ChainSizes").First(&chain, "chains.uid = ?", body.ChainUID); res.Error != nil {
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
		"sizes":            chain.SizesToList(),
		"published":        chain.Published,
		"openToNewMembers": chain.OpenToNewMembers,
	})
}

func ChainGetAll(c *gin.Context) {
	db := getDB(c)

	chains := []models.Chain{}
	if res := db.Preload("ChainSizes").Find(&chains, "chains.published = ?", true); res.Error != nil {
		boom.BadRequest(c.Writer, "chain not found")
		return
	}

	chainsJson := []*gin.H{}
	for _, chain := range chains {
		chainsJson = append(chainsJson, &gin.H{
			"uid":              chain.UID,
			"name":             chain.Name,
			"description":      chain.Description,
			"address":          chain.Address,
			"latitude":         chain.Latitude,
			"longitude":        chain.Longitude,
			"radius":           chain.Radius,
			"sizes":            chain.SizesToList(),
			"published":        chain.Published,
			"openToNewMembers": chain.OpenToNewMembers,
		})
	}

	c.JSON(200, chainsJson)
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
		Sizes       *[]string `json:"sizes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.UID)
	if !ok {
		return
	}

	tx := db.Begin()
	if body.Sizes != nil {
		if ok := models.ValidateAllSizeEnum(*body.Sizes); !ok {
			boom.BadRequest(c.Writer, "size not a valid enum value")
			return
		}

		tx.Exec(`DELETE FROM chain_sizes WHERE chain_id = ?`, chain.ID)
		for _, size := range *body.Sizes {
			tx.Create(&models.ChainSize{
				ChainID:  chain.ID,
				SizeEnum: size,
			})
		}
	}

	optionalValues := map[string]any{
		"name":        body.Name,
		"description": body.Description,
		"address":     body.Address,
		"latitude":    body.Latitude,
		"longitude":   body.Longitude,
		"radius":      body.Radius,
	}
	valuesToUpdate := map[string]any{}
	for k := range optionalValues {
		v := optionalValues[k]

		if v != nil {
			valuesToUpdate[k] = v
		}
	}

	if res := tx.Model(chain).Updates(valuesToUpdate); res.Error != nil {
		boom.Internal(c.Writer)
	}
	if res := tx.Commit(); res.Error != nil {
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

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
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
		UserID:       user.ID,
		ChainID:      chain.ID,
		IsChainAdmin: false,
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
LEFT JOIN users ON user_chains.user_id = users.id 
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
