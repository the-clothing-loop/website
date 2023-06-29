package app

import (
	"fmt"
	"net/http"
	"net/smtp"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/jordan-wright/email"
	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

var smtpAddr string
var smtpAuth smtp.Auth

func MailInit() {
	smtpAddr = fmt.Sprintf("%s:%d", Config.SMTP_HOST, Config.SMTP_PORT)
	if Config.SMTP_PASS != "" {
		smtpAuth = smtp.PlainAuth("", Config.SMTP_USER, Config.SMTP_PASS, Config.SMTP_HOST)
	}
}

func MailSend(c *gin.Context, db *gorm.DB, to string, subject string, body string) bool {
	e := email.NewEmail()
	e.From = fmt.Sprintf("The Clothing Loop <%s>", Config.SMTP_SENDER)
	e.To = []string{to}
	e.Bcc = []string{}
	e.Cc = []string{}
	e.Subject = subject
	e.Text = []byte("")
	e.HTML = []byte(body)
	err := e.Send(smtpAddr, smtpAuth)

	db.Create(&models.Mail{
		To:      to,
		Subject: subject,
		Body:    body,
		Error:   zero.StringFrom(fmt.Sprint(err)),
	})

	if err != nil {
		goscope.Log.Errorf("Unable to send email: %v", err)
		if c != nil {
			c.String(http.StatusInternalServerError, "Unable to send email")
		}
		return false
	}

	return true
}
