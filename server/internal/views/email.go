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
	"gorm.io/gorm"

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
var lang = []string{"en", "nl", "de", "fr", "es", "he", "sv", "it"}

func init() {
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

func getI18nGin(c *gin.Context) string {
	i18n, _ := c.Cookie("i18next")
	return getI18n(i18n)
}
func getI18n(i18n string) string {
	switch i18n {
	case "nl", "de", "fr", "he", "es", "sv":
	default:
		i18n = "en"
	}
	return i18n
}

// Adds subject and body to message
func emailGenerateMessage(m *models.Mail, lng, templateName string, data any, subjectValues ...any) error {
	// subject
	var subject string
	{
		templateKey := "header_" + templateName
		m.Subject = fmt.Sprintf(emailsTranslations[lng][templateKey], subjectValues...)
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
		m.Body = buf.String()
	}

	return nil
}

func EmailAccountDeletedSuccessfully(db *gorm.DB, lng,
	name,
	email string,
) error {
	lng = getI18n(lng)

	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "account_deleted_successfully", gin.H{
		"Name": name,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailAnAdminApprovedYourJoinRequest(db *gorm.DB, lng,
	name,
	email,
	chainName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "an_admin_approved_your_join_request", gin.H{
		"Name":      name,
		"ChainName": chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailAnAdminDeniedYourJoinRequest(db *gorm.DB, lng,
	name,
	email,
	chainName,
	reason string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "an_admin_denied_your_join_request", gin.H{
		"Name":      name,
		"ChainName": chainName,
		"Reason":    reason,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

type EmailApproveReminderItem struct {
	Name        string `gorm:"name"`
	Email       string `gorm:"email"`
	ChainID     uint   `gorm:"chain_id"`
	UserChainID uint   `gorm:"user_chain_id"`
	ChainName   string `gorm:"chain_name"`
}

func EmailApproveReminder(db *gorm.DB, lng,
	name,
	email string,
	approvals []*EmailApproveReminderItem,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "approve_reminder", gin.H{
		"Name":      name,
		"BaseURL":   app.Config.SITE_BASE_URL_FE,
		"Approvals": approvals,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailContactConfirmation(c *gin.Context, db *gorm.DB,
	name,
	email,
	message string,
) error {
	i18n := getI18nGin(c)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, i18n, "contact_confirmation", gin.H{
		"Name":    name,
		"Message": message,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailContactReceived(db *gorm.DB,
	name,
	email,
	message string,
) error {
	m := app.MailCreate()
	m.ToName = "The Clothing Loop"
	m.ToAddress = app.Config.SMTP_SENDER
	err := emailGenerateMessage(m, "en", "contact_received", gin.H{
		"Name":    name,
		"Email":   email,
		"Message": message,
	}, name)
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailDoYouWantToBeHost(db *gorm.DB, lng,
	name,
	email,
	chainName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "do_you_want_to_be_host", gin.H{
		"Name":      name,
		"ChainName": chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailIsYourLoopStillActive(db *gorm.DB, lng,
	name,
	email,
	chainName,
	participantName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "is_your_loop_still_active", gin.H{
		"Name":            name,
		"ParticipantName": participantName,
		"ChainName":       chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailLoginVerification(c *gin.Context, db *gorm.DB,
	name,
	email,
	token string,
	isApp bool,
) error {
	i18n := getI18nGin(c)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, i18n, "login_verification", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
		"IsApp":   isApp,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailLoopIsDeleted(db *gorm.DB, lng,
	name,
	email,
	chainName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "loop_is_deleted", gin.H{
		"Name":      name,
		"ChainName": chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailPoke(db *gorm.DB, lng,
	name,
	email,
	participantName,
	chainName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "poke", gin.H{
		"Name":            name,
		"ChainName":       chainName,
		"ParticipantName": participantName,
	}, name, chainName)
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailRegisterVerification(c *gin.Context, db *gorm.DB,
	name,
	email,
	token string,
) error {
	i18n := getI18nGin(c)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, i18n, "register_verification", gin.H{
		"Name":    name,
		"BaseURL": app.Config.SITE_BASE_URL_FE,
		"Token":   token,
	})
	if err != nil {
		return err
	}
	return app.MailSend(db, m)
}

func EmailSomeoneIsInterestedInJoiningYourLoop(db *gorm.DB, lng,
	adminEmail,
	adminName,
	chainName,
	participantName,
	participantEmail,
	participantPhoneNumber,
	participantAddress string,
	participantSizeEnums []string,
) error {
	lng = getI18n(lng)

	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = adminName
	m.ToAddress = adminEmail

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
	err := emailGenerateMessage(m, lng, "someone_is_interested_in_joining_your_loop", gin.H{
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

	return app.MailSend(db, m)
}

func EmailSomeoneLeftLoop(db *gorm.DB, lng,
	name,
	email,
	chainName,
	participantName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "someone_left_loop", gin.H{
		"Name":            name,
		"ParticipantName": participantName,
		"ChainName":       chainName,
	})
	if err != nil {
		return err
	}
	return app.MailSend(db, m)
}

func EmailSomeoneWaitingToBeAccepted(db *gorm.DB, lng,
	name,
	email,
	chainName,
	participantName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.MaxRetryAttempts = models.MAIL_RETRY_TWO_DAYS
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "someone_waiting_to_be_accepted", gin.H{
		"Name":            name,
		"ParticipantName": participantName,
		"ChainName":       chainName,
	})
	if err != nil {
		return err
	}
	return app.MailSend(db, m)
}

func EmailSubscribeToNewsletter(c *gin.Context, db *gorm.DB,
	name,
	email string,
) error {
	i18n := getI18nGin(c)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, i18n, "subscribed_to_newsletter", gin.H{"Name": name})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailYouSignedUpForLoop(db *gorm.DB, lng,
	name,
	email,
	chainName string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "you_signed_up_for_loop", gin.H{
		"Name":      name,
		"ChainName": chainName,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailYourLoopDeletedNextMonth(db *gorm.DB, lng,
	name,
	email,
	chainName,
	chainUID string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "your_loop_deleted_next_month", gin.H{
		"Name":      name,
		"ChainName": chainName,
		"ChainUID":  chainUID,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailYourLoopDeletedNextWeek(db *gorm.DB, lng,
	name,
	email,
	chainName,
	chainUID string,
) error {
	lng = getI18n(lng)
	m := app.MailCreate()
	m.ToName = name
	m.ToAddress = email
	err := emailGenerateMessage(m, lng, "your_loop_deleted_next_week", gin.H{
		"Name":      name,
		"ChainName": chainName,
		"ChainUID":  chainUID,
	})
	if err != nil {
		return err
	}

	return app.MailSend(db, m)
}

func EmailRootAdminFailedLastRetry(db *gorm.DB, email, subject string) error {
	m := app.MailCreate()

	m.ToName = "The Clothing Loop"
	m.ToAddress = app.Config.SMTP_SENDER
	m.Subject = "Failed last attempt to send email"
	m.Body = fmt.Sprintf("Failed to send email<br/><strong>To:</strong> %s<br/><strong>Subject:</strong> %s", email, subject)

	return app.MailSend(db, m)
}
