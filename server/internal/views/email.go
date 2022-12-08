package views

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"log"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
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
	lang := []string{"en", "nl"}

	for _, l := range lang {
		b, err := emailsFS.ReadFile(fmt.Sprintf("emails/%s/headers.json", l))
		if err != nil {
			log.Fatalf("Header not found: %+v", err)
			return
		}
		var header map[string]string
		err = json.Unmarshal(b, &header)
		if err != nil {
			log.Fatalf("Header invalid json: %+v", err)
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
	adminEmail string,
	adminName string,
	participantName string,
	participantEmail string,
	participantPhoneNumber string,
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

func EmailContactUserMessage(c *gin.Context, db *gorm.DB, name string, email string, message string) bool {
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

func EmailContactConfirmation(c *gin.Context, db *gorm.DB, name string, email string, message string) bool {
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

func EmailSubscribeToNewsletter(c *gin.Context, db *gorm.DB, name string, email string) bool {
	i18n := getI18n(c)
	to := email
	subject := emailsHeaders[i18n]["subscribed_to_newsletter"]
	body, err := executeTemplate(c, emailsTemplates[i18n], "subscribed_to_newsletter.gohtml", gin.H{"Name": name})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}
