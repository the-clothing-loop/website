package views

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//go:embed emails
var emailsFS embed.FS

var emailsHeaders = map[string]map[string]string{}
var emailsTemplates = map[string]*template.Template{
	"en": mustParseFS(emailsFS, "emails/en/*.gohtml"),
	"nl": mustParseFS(emailsFS, "emails/nl/*.gohtml"),
	"de": mustParseFS(emailsFS, "emails/de/*.gohtml"),
	"fr": mustParseFS(emailsFS, "emails/fr/*.gohtml"),
	"es": mustParseFS(emailsFS, "emails/es/*.gohtml"),
	"sv": mustParseFS(emailsFS, "emails/sv/*.gohtml"),
}

func init() {
	lang := []string{"en", "nl", "de", "fr", "es", "sv"}

	for _, l := range lang {
		b, err := emailsFS.ReadFile(fmt.Sprintf("emails/%s/headers.json", l))
		if err != nil {
			glog.Fatalf("Header not found: %v", err)
			return
		}
		var header map[string]string
		err = json.Unmarshal(b, &header)
		if err != nil {
			glog.Fatalf("Header invalid json: %v", err)
			return
		}
		emailsHeaders[l] = header
	}
}

func getI18n(c *gin.Context) string {
	i18n, _ := c.Cookie("i18next")
	switch i18n {
	case "nl", "de", "fr", "es", "sv":
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
	chainName,
	participantName,
	participantEmail,
	participantPhoneNumber,
	participantAddress string,
) bool {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"

	to := adminEmail
	subject := emailsHeaders[i18n]["someone_is_interested_in_joining_your_loop"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "someone_is_interested_in_joining_your_loop.gohtml", gin.H{
		"Name":      adminName,
		"ChainName": chainName,
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
	participantName,
	participantEmail,
	chainName,
	reason,
	headerName,
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
		"Reason":    reason,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}

func EmailPoke(
	c *gin.Context,
	db *gorm.DB,
	hostName,
	email,
	participantName,
	chainName string,
) bool {
	i18n := "en"
	to := email
	subject := fmt.Sprintf(emailsHeaders[i18n]["poke"], participantName, chainName)
	body, err := executeTemplate(c, emailsTemplates[i18n], "poke.gohtml", gin.H{
		"Name":            hostName,
		"ParticipantName": participantName,
		"ChainName":       chainName,
	})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}
