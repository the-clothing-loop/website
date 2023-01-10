package controllers

import (
	"errors"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/CollActionteam/clothing-loop/server/internal/views"
	glog "github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
)

func ContactNewsletter(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Name      string `json:"name" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Subscribe bool   `json:"subscribe"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	if !body.Subscribe {
		db.Raw("DELETE FROM newsletters WHERE email = ?", body.Email)

		return
	}

	name := body.Name
	var row struct{ Name string }
	db.Raw("SELECT name FROM users WHERE email = ? LIMIT 1", body.Email).Scan(&row)
	if row.Name != "" {
		name = row.Name
	}

	n := &models.Newsletter{
		Name:     name,
		Email:    body.Email,
		Verified: true,
	}
	err := n.CreateOrUpdate(db)
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
		return
	}

	views.EmailSubscribeToNewsletter(c, db, name, body.Email)
}

func ContactMail(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	views.EmailContactUserMessage(c, db, body.Name, body.Email, body.Message)
	views.EmailContactConfirmation(c, db, body.Name, body.Email, body.Message)
}
