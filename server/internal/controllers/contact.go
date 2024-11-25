package controllers

import (
	"log/slog"
	"net/http"

	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"github.com/the-clothing-loop/website/server/sharedtypes"

	"github.com/gin-gonic/gin"
)

func ContactNewsletter(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ContactNewsletterRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if !body.Subscribe {
		db.Raw("DELETE FROM newsletters WHERE email = ?", body.Email)
		if app.Brevo != nil {
			app.Brevo.DeleteContact(c.Request.Context(), body.Email)
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
		slog.Error(err.Error())
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	ctx := c.Request.Context()
	if app.Brevo != nil {
		if err = app.Brevo.ExistsContact(ctx, body.Email); err == nil {
			c.String(http.StatusAlreadyReported, "Already subscribed")
			return
		}
		app.Brevo.CreateContact(ctx, body.Email)
	}

	views.EmailSubscribeToNewsletter(c, db, name, body.Email)
}

func ContactMail(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ContactMailRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	err := views.EmailContactReceived(db, body.Name, body.Email, body.Message)
	if err != nil {
		slog.Error("Unable to send email", "err", err)
		c.String(http.StatusInternalServerError, "Unable to send email")
		return
	}

	err = views.EmailContactConfirmation(c, db, body.Name, body.Email, body.Message)
	if err != nil {
		slog.Error("Unable to send email", "err", err)
		c.String(http.StatusInternalServerError, "Unable to send email")
		return
	}
}
