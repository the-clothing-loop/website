package controllers

import (
	"net/http"

	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/CollActionteam/clothing-loop/local/models"
	"github.com/CollActionteam/clothing-loop/local/views"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func ChainCreate(c *gin.Context) {
	ok, user := middlewareAuthCookieStart(c, models.RoleChainAdmin)
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
		Categories  []string `json:"categories" binding:"required"`
		Sizes       []string `json:"sizes" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}
	if ok := models.ValidateAllCategoryEnum(body.Categories); !ok {
		boom.BadRequest(c.Writer, "category not a valid enum value")
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Sizes); !ok {
		boom.BadRequest(c.Writer, "size not a valid enum value")
		return
	}

	categoriesLLs := []models.CategoriesLL{}
	for _, categoryEnum := range body.Categories {
		categoriesLLs = append(categoriesLLs, models.CategoriesLL{
			CategoryEnum: categoryEnum,
		})
	}

	chainSizes := []models.ChainSize{}
	for _, size := range body.Sizes {
		chainSizes = append(chainSizes, models.ChainSize{
			SizeEnum: size,
		})
	}

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
		Categories:       categoriesLLs,
		Sizes:            chainSizes,
		Users: []models.UserChainLL{
			{UserID: user.ID, ChainAdmin: true},
		},
	}
	global.DB.Create(&chain)

	if ok = middlewareAuthCookieEnd(c, user); !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func ChainAddUser(c *gin.Context) {
	var body struct {
		UserUID    string `json:"user_uid" binding:"required,uuid"`
		ChainUID   string `json:"chain_uid" binding:"required,uuid"`
		ChainAdmin bool   `json:"chain_admin"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	ok, adminUser := middlewareAuthCookieStart(c, models.RoleChainAdmin)
	if !ok {
		return
	}
	ok, chain := middlewareAuthCheckChainRelation(c, adminUser, body.ChainUID)
	if !ok {
		return
	}

	var user models.User
	if res := global.DB.Where("uid = ? AND enabled = ? AND email_verified = ?", body.UserUID, true, true).First(&user); res.Error != nil {
		boom.BadRequest(c.Writer, "User does not exist")
		return
	}

	if chain.OpenToNewMembers == false {
		boom.BadRequest(c.Writer, "This loop is not currently open to new members")
		return
	}

	if res := global.DB.Where("user_id = ? AND chain_id = ?", user.ID, chain.ID).First(&models.UserChainLL{}); res.Error == nil {
		boom.BadRequest(c.Writer, "This user is already a member")
	}

	if res := global.DB.Create(&models.UserChainLL{
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
	global.DB.Raw("SELECT user.name as name, user.email as email FROM user_chain_ll JOIN user ON user_chain_ll.user_id = user.id WHERE user_chain_ll.chain_id = ? AND user_chain_ll.chain_admin = ? AND user.enabled = ?", chain.ID, true, true).Scan(&results)

	if len(results) == 0 {
		boom.Internal(c.Writer, "No admins exist for this loop")
		return
	}

	for _, result := range results {
		views.EmailAParticipantJoinedTheLoop(
			c,
			result.Email,
			result.Name,
			user.Name,
			user.Email,
			user.PhoneNumber,
		)
	}

	middlewareAuthCookieEnd(c, adminUser)
}
