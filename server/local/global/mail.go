package global

import (
	"fmt"
	"net/smtp"

	"github.com/CollActionteam/clothing-loop/local/models"
	boom "github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"github.com/jordan-wright/email"
)

var smtpHost string
var smtpPort int
var SmtpSender string
var smtpUser string
var smtpPass string

var smtpAddr = fmt.Sprintf("%s:%d", smtpHost, smtpPort)
var smtpAuth = smtp.PlainAuth("", SmtpSender, smtpPass, smtpHost)

// like "https://www.clothingloop.org/"
var Url string

func MailInit(
	smtpHost_ string,
	smtpPort_ int,
	smtpSender_ string,
	smtpUser_ string,
	smtpPass_ string,
) {
	smtpHost = smtpHost_
	smtpPort = smtpPort_
	SmtpSender = smtpSender_
	smtpUser = smtpUser_
	smtpPass = smtpPass_
}

func MailSend(c *gin.Context, to string, subject string, body string) bool {
	e := email.NewEmail()
	e.From = fmt.Sprintf("The Clothing Loop <%s>", SmtpSender)
	e.To = []string{to}
	e.Bcc = []string{}
	e.Cc = []string{}
	e.Subject = subject
	e.Text = []byte("")
	e.HTML = []byte(body)
	errEmail := e.Send(smtpAddr, smtpAuth)

	var errorStrOrNil *string
	if errEmail != nil {
		errorStr := fmt.Sprint(errEmail)
		errorStrOrNil = &errorStr
	}

	DB.Create(models.Mail{
		To: to,
		Message: struct {
			Subject string
			Html    string
		}{
			Subject: subject,
			Html:    body,
		},
		Error: errorStrOrNil,
	})

	if errEmail != nil {
		boom.Internal(c.Writer, "unable to sent email")
		return false
	}

	return true
}
