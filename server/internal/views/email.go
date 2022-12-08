package views

import (
	"embed"
	"encoding/json"
	"fmt"
	"log"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//go:embed emails
var emailsFS embed.FS

var emailsHeaders = map[string]map[string]string{}
var emailsTemplates = mustParseFS(emailsFS, "emails/*.gohtml")

func init() {
	lang := []string{"en", "nl"}

	for _, l := range lang {
		b, err := emailsFS.ReadFile(fmt.Sprintf("emails/%s_headers.json", l))
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
	if i18n == "" {
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
	to := adminEmail
	subject := "A participant just joined your Loop!"
	body := fmt.Sprintf(`<p>Hi, %s</p>
<p>A new participant just joined your Loop.</p>
<p>Please find below the participant's contact information:</p>
<ul>
	<li>Name: %s</li>
	<li>Email: %s</li>
	<li>Phone: %s</li>
	<li>Address: %s</li>
</ul>
<p>Best,</p>
<p>Nichon, on behalf of the Clothing Loop team</p>`,
		adminName,
		participantName,
		participantEmail,
		participantPhoneNumber,
		participantAddress,
	)

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
	to := email
	subject := "Thank you for contacting the Clothing Loop"
	body := fmt.Sprintf(`<p>Hi %s,</p>
<p>Thank you for your message!</p>
<p>You wrote:</p>
<p>%s</p>
<p>We will contact you as soon as possible.</p>
<p>Regards,</p>
<p>Nichon, on behalf of the Clothing Loop team</p>`,
		name,
		message,
	)

	return app.MailSend(c, db, to, subject, body)
}

func EmailSubscribeToNewsletter(c *gin.Context, db *gorm.DB, name string, email string) bool {
	i18n := getI18n(c)
	to := email

	subject := emailsHeaders[i18n]["subscribed_to_newsletter"]
	body, err := executeTemplate(c, emailsTemplates, fmt.Sprintf("%s_subscribed_to_newsletter.gohtml", i18n), gin.H{"Name": name})
	if err != nil {
		return false
	}

	return app.MailSend(c, db, to, subject, body)
}
