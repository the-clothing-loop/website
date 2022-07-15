package controllers

import (
	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/CollActionteam/clothing-loop/local/models"
	"github.com/CollActionteam/clothing-loop/local/views"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

func ContactNewsletter(c *gin.Context) {
	var body struct {
		Email     string `json:"email" binding:"required,email"`
		Subscribe bool   `json:"subscribe" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	if body.Subscribe == false {
		global.DB.Where("email = ?", query.Email).Delete(&models.User{})

		return
	}

	name := "fellow human!"
	var user models.User
	global.DB.Raw("SELECT name FROM user WHERE email = ? LIMIT 1", body.Email).Scan(&user)
	if user.Name != "" {
		name = user.Name
	}

	global.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.Newsletter{
		Name:  name,
		Email: body.Email,
	})

	views.EmailSubscribeToNewsletter(c, name, body.Email)
}

func ContactMail(c *gin.Context) {
	var body struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, err)
		return
	}

	views.EmailContactUserMessage(c, body.Name, body.Email, body.Message)
	views.EmailContactConfirmation(c, body.Name, body.Email, body.Message)
}
