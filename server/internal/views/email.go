package views

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	glog "github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//go:embed emails
var emailsFS embed.FS

var emailsHeaders = map[string]map[string]string{}
var emailsTemplates = map[string]*template.Template{
	"en": mustParseFS(emailsFS, "emails/en/*.gohtml"),
	"nl": mustParseFS(emailsFS, "emails/nl/*.gohtml"),
}

func init() {
	lang := []string{"en", "nl", "fr"}

	for _, l := range lang {
		b, err := emailsFS.ReadFile(fmt.Sprintf("emails/%s/headers.json", l))
		if err != nil {
			glog.Fatalf("Header not found: %+v", err)
			return
		}
		var header map[string]string
		err = json.Unmarshal(b, &header)
		if err != nil {
			glog.Fatalf("Header invalid json: %+v", err)
			return
		}
		emailsHeaders[l] = header
	}
}

func getI18n(c *gin.Context) string {
	i18n, _ := c.Cookie("i18next")
	switch i18n {
	case "nl":
	default:
		i18n = "en"
	}
	return i18n
}

func EmailAParticipantJoinedTheLoop(
	c *gin.Context,
	db *gorm.DB,
	adminEmail,
	adminName,
	participantName,
	participantEmail,
	participantPhoneNumber,
	participantAddress string,
) bool {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"

	to := adminEmail
	subject := emailsHeaders[i18n]["a_participant_joined_the_loop"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "a_participant_joined_the_loop.gohtml", gin.H{
		"Name": adminName,
		"Participant": gin.H{
			"Name":    participantName,
			"Email":   participantEmail,
			"Phone":   participantPhoneNumber,
			"Address": participantAddress,
		},
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailContactUserMessage(c *gin.Context, db *gorm.DB, name, email, message string) bool {
	to := app.Config.SMTP_SENDER
	subject := fmt.Sprintf("Clothing Loop Contact Form - %s", name)
	body := fmt.Sprintf(`<h3>Name</h3>
<p>%s</p>
<h3>Email</h3>
<p>%s</p>
<h3>Message</h3>
<p>%s</p>`, name, email, message)

	return app.MailSend(c, db, to, subject, body)
}

func EmailContactConfirmation(c *gin.Context, db *gorm.DB, name, email, message string) bool {
	i18n := getI18n(c)
	to := email
	subject := emailsHeaders[i18n]["contact_confirmation"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "contact_confirmation.gohtml", gin.H{
		"Name":    name,
		"Message": message,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailSubscribeToNewsletter(c *gin.Context, db *gorm.DB, name, email string) bool {
	i18n := getI18n(c)
	to := email
	subject := emailsHeaders[i18n]["subscribed_to_newsletter"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "subscribed_to_newsletter.gohtml", gin.H{"Name": name})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailRegisterVerification(c *gin.Context, db *gorm.DB, name, email, token string) bool {
	i18n := getI18n(c)
	to := email
	subject := emailsHeaders[i18n]["register_verification"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "register_verification.gohtml", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailLoginVerification(c *gin.Context, db *gorm.DB, name, email, token string) bool {
	i18n := getI18n(c)
	to := email
	subject := emailsHeaders[i18n]["login_verification"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "login_verification.gohtml", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailToLoopParticipant(
	c *gin.Context,
	db *gorm.DB,
	participantName string,
	participantEmail string,
	chainName string,
	textBody string,
	headerName string,
	templateName string,
) bool {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"

	to := participantEmail
	subject := emailsHeaders[i18n][headerName]
	body, err := executeTemplate(c, emailsTemplates[i18n], templateName, gin.H{
		"Name":      participantName,
		"ChainName": chainName,
		"textBody": textBody,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}
