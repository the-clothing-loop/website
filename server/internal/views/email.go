package views

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/wneessen/go-mail"

	"github.com/gin-gonic/gin"
)

const (
	EmailTemplateSubscribedToNewsletter               = "subscribed_to_newsletter"
	EmailTemplateContactConfirmation                  = "contact_confirmation"
	EmailTemplateSomeoneIsInterestedInJoiningYourLoop = "someone_is_interested_in_joining_your_loop"
	EmailTemplateAnAdminApprovedYourJoinRequest       = "an_admin_approved_your_join_request"
	EmailTemplateLoginVerification                    = "login_verification"
	EmailTemplateAnAdminDeniedYourJoinRequest         = "an_admin_denied_your_join_request"
	EmailTemplateRegisterVerification                 = "register_verification"
	EmailTemplatePoke                                 = "poke"
	EmailTemplateApproveReminder                      = "approve_reminder"
	EmailTemplateContactReceived                      = "contact_received"
)

type EmailLayoutData struct {
	RTL     bool
	Subject string
	Body    template.HTML
	BaseURL string

	I18nMuchLoveComma       string
	I18nTheClothingLoopTeam string
	I18nEvents              string
	I18nDonate              string
	I18nAboutUs             string
	I18nFAQ                 string
}

//go:embed emails
var emailsFS embed.FS

var emailsTranslations = map[string]map[string]string{}
var emailsTemplates = map[string]*template.Template{
	"en": mustParseFS(emailsFS, "emails/en/*.gohtml"),
	"nl": mustParseFS(emailsFS, "emails/nl/*.gohtml"),
	"de": mustParseFS(emailsFS, "emails/de/*.gohtml"),
	"fr": mustParseFS(emailsFS, "emails/fr/*.gohtml"),
	"es": mustParseFS(emailsFS, "emails/es/*.gohtml"),
	"he": mustParseFS(emailsFS, "emails/he/*.gohtml"),
	"sv": mustParseFS(emailsFS, "emails/sv/*.gohtml"),
	"it": mustParseFS(emailsFS, "emails/it/*.gohtml"),
}
var emailLayoutTemplate = mustParseFS(emailsFS, "emails/layout.gohtml")

func init() {
	lang := []string{"en", "nl", "de", "fr", "es", "he", "sv", "it"}

	for _, l := range lang {
		b, err := emailsFS.ReadFile(fmt.Sprintf("emails/%s/translations.json", l))
		if err != nil {
			glog.Fatalf("Translations not found: %v", err)
			return
		}
		var data map[string]string
		err = json.Unmarshal(b, &data)
		if err != nil {
			glog.Fatalf("Translation invalid json: %v", err)
			return
		}
		emailsTranslations[l] = data
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

// Adds subject and body to message
func emailGenerateMessage(m *mail.Msg, lng, templateName string, data any, subjectValues ...any) error {
	// subject
	var subject string
	{
		templateKey := "header_" + templateName
		subject = fmt.Sprintf(emailsTranslations[lng][templateKey], subjectValues...)
		m.Subject(subject)
	}

	bodyBuffer := new(bytes.Buffer)
	// body
	{
		templateFile := fmt.Sprintf("%s.gohtml", templateName)
		err := emailsTemplates[lng].ExecuteTemplate(bodyBuffer, templateFile, data)
		if err != nil {
			return err
		}
	}

	// layout
	{
		buf := new(bytes.Buffer)
		layoutT := emailLayoutTemplate
		baseURL := fmt.Sprintf("%s/%s", app.Config.SITE_BASE_URL_FE, lng)
		err := layoutT.Execute(buf, EmailLayoutData{
			RTL:                     lng == "he" || lng == "ar",
			Subject:                 subject,
			Body:                    template.HTML(bodyBuffer.String()),
			BaseURL:                 baseURL,
			I18nMuchLoveComma:       emailsTranslations[lng]["layout_much_love_comma"],
			I18nTheClothingLoopTeam: emailsTranslations[lng]["layout_the_clothing_loop_team"],
			I18nEvents:              emailsTranslations[lng]["layout_events"],
			I18nDonate:              emailsTranslations[lng]["layout_donate"],
			I18nAboutUs:             emailsTranslations[lng]["layout_about_us"],
			I18nFAQ:                 emailsTranslations[lng]["layout_faq"],
		})
		if err != nil {
			return err
		}
		m.SetBodyString(mail.TypeTextHTML, buf.String())
	}

	return nil
}

func EmailAParticipantJoinedTheLoop(c *gin.Context,
	adminEmail,
	adminName,
	chainName,
	participantName,
	participantEmail,
	participantPhoneNumber,
	participantAddress string,
	participantSizeEnums []string,
) error {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"

	m := app.MailCreate()
	m.AddToFormat(adminName, adminEmail)

	sizesHtml := ""
	{
		childrenAdded := false
		womenAdded := false
		menAdded := false
		// http://localhost:3000/images/categories/men-50.png
		imgEl := `<img src="` + app.Config.SITE_BASE_URL_FE + `/images/categories/%s-50.png" alt="%s" width="12" height="12" style="padding-left: 30px; height: 12px; width: 12px"/>`
		for _, v := range participantSizeEnums {
			switch v {
			case models.SizeEnumBaby, models.SizeEnum1_4YearsOld, models.SizeEnum5_12YearsOld:
				if !childrenAdded {
					sizesHtml += "<br/>" + fmt.Sprintf(imgEl, "baby", "baby") + " "
					childrenAdded = true
				}
			case models.SizeEnumMenSmall, models.SizeEnumMenMedium, models.SizeEnumMenLarge, models.SizeEnumMenPlusSize:
				if !menAdded {
					sizesHtml += "<br/>" + fmt.Sprintf(imgEl, "man", "man") + " "
					menAdded = true
				}
			case models.SizeEnumWomenSmall, models.SizeEnumWomenMedium, models.SizeEnumWomenLarge, models.SizeEnumWomenPlusSize:
				if !womenAdded {
					sizesHtml += "<br/>" + fmt.Sprintf(imgEl, "woman", "woman") + " "
					womenAdded = true
				}

			}
			sizesHtml += models.SizeLetters[v] + " "
		}
	}
	err := emailGenerateMessage(m, i18n, "someone_is_interested_in_joining_your_loop", gin.H{
		"Name":      adminName,
		"ChainName": chainName,
		"Participant": gin.H{
			"Name":    participantName,
			"Email":   participantEmail,
			"Phone":   participantPhoneNumber,
			"Address": participantAddress,
			"Sizes":   template.HTML(sizesHtml),
		},
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailContactUserMessage(c *gin.Context,
	name,
	email,
	message string,
) error {
	m := app.MailCreate()
	m.AddToFormat("The Clothing Loop", app.Config.SMTP_SENDER)
	err := emailGenerateMessage(m, "en", "contact_confirmation", gin.H{
		"Name":    name,
		"Email":   email,
		"Message": message,
	}, email)
	if err != nil {
		return err
	}

	return app.MailSend(m)
}
func EmailContactConfirmation(c *gin.Context,
	name,
	email,
	message string,
) error {
	i18n := getI18n(c)
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "contact_confirmation", gin.H{
		"Name":    name,
		"Message": message,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailSubscribeToNewsletter(c *gin.Context,
	name,
	email string,
) error {
	i18n := getI18n(c)
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "subscribed_to_newsletter", gin.H{"Name": name})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailRegisterVerification(c *gin.Context,
	name,
	email,
	token string,
) error {
	i18n := getI18n(c)
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "register_verification", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
	})
	if err != nil {
		return err
	}
	return app.MailSend(m)
}

func EmailLoginVerification(c *gin.Context,
	name,
	email,
	token string,
	isApp bool,
) error {
	i18n := getI18n(c)
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "login_verification", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
		"IsApp":   isApp,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailAnAdminApprovedYourJoinRequest(c *gin.Context,
	name,
	email,
	chainName string,
) error {
	i18n := getI18n(c)
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "an_admin_approved_your_join_request", gin.H{
		"Name":      name,
		"ChainName": chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailAnAdminDeniedYourJoinRequest(c *gin.Context,
	name,
	email,
	chainName,
	reason string,
) error {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "an_admin_denied_your_join_request", gin.H{
		"Name":      name,
		"ChainName": chainName,
		"Reason":    reason,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

func EmailPoke(c *gin.Context,
	name,
	email,
	participantName,
	chainName string,
) error {
	i18n := "en"
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "poke", gin.H{
		"Name":            name,
		"ChainName":       chainName,
		"ParticipantName": participantName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}

type EmailApproveReminderItem struct {
	Name        string `gorm:"name"`
	Email       string `gorm:"email"`
	ChainID     uint   `gorm:"chain_id"`
	UserChainID uint   `gorm:"user_chain_id"`
	ChainName   string `gorm:"chain_name"`
}

func EmailApproveReminder(
	name,
	email string,
	approvals []*EmailApproveReminderItem,
) error {
	// ? language hardcoded to english until language preference can be determined in the database
	// i18n := getI18n(c)
	i18n := "en"
	m := app.MailCreate()
	m.AddToFormat(name, email)
	err := emailGenerateMessage(m, i18n, "approve_reminder", gin.H{
		"Name":      name,
		"BaseURL":   app.Config.SITE_BASE_URL_FE,
		"Approvals": approvals,
	})
	if err != nil {
		return err
	}

	return app.MailSend(m)
}
