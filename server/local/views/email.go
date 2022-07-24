package views

import (
	"fmt"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func EmailAParticipantJoinedTheLoop(
	c *gin.Context,
	db *gorm.DB,
	adminEmail string,
	adminName string,
	participantName string,
	participantEmail string,
	participantPhoneNumber string,
) bool {
	to := adminEmail
	subject := "A participant just joined your Loop!"
	body := fmt.Sprintf(`<p>Hi, %s</p>
<p>A new participant just joined your loop.</p>
<p>Please find below the participant's contact information:</p>
<ul>
	<li>Name: %s</li>
	<li>Email: %s</li>
	<li>Phone: %s</li>
</ul>
<p>Best,</p>
<p>Nichon, on behalf of the Clothing Loop team</p>`,
		adminName,
		participantName,
		participantEmail,
		participantPhoneNumber,
	)

	return app.MailSend(c, db, to, subject, body)
}

func EmailContactUserMessage(c *gin.Context, db *gorm.DB, name string, email string, message string) bool {
	to := app.Config.SMTP_SENDER
	subject := fmt.Sprintf("ClothingLoop Contact Form - %s", name)
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
	subject := "Thank you for contacting The Clothing Loop"
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
	to := email
	subject := "Thank you for subscribing to Clothing Loop"
	body := fmt.Sprintf(`<p>Hi %s,</p>

<p>Hurrah! You are now subscribed to our newsletter.</p>
<p> Expect monthly updates full of inspiration, </p>
<p>swap highlights and all kinds of wonderful Clothing Loop related stories.</p>

<p>And please do reach out if you have exciting news or a nice Clothing Loop story you would like to share.</p>
<p>We’d love to hear from you! <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a></p>

<p>Changing the fashion world one swap at a time, let’s do it together!</p>

<p>Thank you for your interest and support.</p>

<p>Nichon, on behalf of the Clothing Loop team</p>`, name)

	return app.MailSend(c, db, to, subject, body)
}
