package app

import (
	"fmt"
	"net/smtp"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	boom "github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"github.com/jordan-wright/email"
	"gorm.io/gorm"
)

var smtpAddr string
var smtpAuth smtp.Auth

func MailInit() {
	smtpAddr = fmt.Sprintf("%s:%d", Config.SMTP_HOST, Config.SMTP_PORT)
	smtpAuth = smtp.PlainAuth("", Config.SMTP_SENDER, Config.SMTP_PASS, Config.SMTP_HOST)
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
	errEmail := e.Send(smtpAddr, smtpAuth)

	db.Create(&models.Mail{
		To:      to,
		Subject: subject,
		Body:    body,
		Error:   fmt.Sprint(errEmail),
	})

	if errEmail != nil {
		boom.Internal(c.Writer, "unable to sent email")
		return false
	}

	return true
}
