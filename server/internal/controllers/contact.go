package controllers

import (
	"errors"
	"net/http"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"

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
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if !body.Subscribe {
		db.Raw("DELETE FROM newsletters WHERE email = ?", body.Email)
		if app.SendInBlue != nil {
			app.SendInBlue.DeleteContact(c.Request.Context(), body.Email)
		}

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
		goscope.Log.Errorf(err.Error())
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	if app.SendInBlue != nil {
		app.SendInBlue.CreateContact(c.Request.Context(), body.Email)
	}

	views.EmailSubscribeToNewsletter(c, db, name, body.Email)
}

func ContactMail(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Message  string `json:"message" binding:"required"`
		Honeypot *bool  `json:"accept"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if !(body.Honeypot != nil && !*body.Honeypot) {
		return
	}

	err2 := views.EmailContactReceived(c, db, body.Name, body.Email, body.Message)
	if err2 != nil {
		glog.Errorf("Unable to send email: %v", err2)
	}

	err := views.EmailContactConfirmation(c, db, body.Name, body.Email, body.Message)
	if err != nil {
		glog.Errorf("Unable to send email: %v", err)
	}

	if err2 != nil || err == nil {
		c.AbortWithError(http.StatusInternalServerError, errors.New("Unable to send email"))
	}
}
