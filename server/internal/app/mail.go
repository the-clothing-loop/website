package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gorm.io/gorm"

	gomail "github.com/wneessen/go-mail"
)

var smtpClient *gomail.Client

func MailInit() {
	var err error
	smtpClient, err = gomail.NewClient(Config.SMTP_HOST, gomail.WithPort(Config.SMTP_PORT))
	if err != nil {
		panic(err)
	}

	if Config.SMTP_PASS == "" {
		smtpClient.SetTLSPolicy(gomail.NoTLS)
	} else {
		smtpClient.SetSMTPAuth(gomail.SMTPAuthPlain)
		smtpClient.SetUsername(Config.SMTP_USER)
		smtpClient.SetPassword(Config.SMTP_PASS)
	}
}

func MailCreate() *models.Mail {
	m := &models.Mail{
		SenderName:    "The Clothing Loop",
		SenderAddress: Config.SMTP_SENDER,
	}
	return m
}

func MailSend(db *gorm.DB, m *models.Mail) error {
	if Config.ENV == EnvEnumAcceptance && strings.HasSuffix(m.ToAddress, "@example.com") {
		return nil
	}

	var err error
	if Config.SENDINBLUE_API_KEY != "" {
		err = mailSendByBrevoApi(m)
	} else {
		err = mailSendBySmtp(m)
	}
	if err != nil {
		goscope.Log.Errorf("Unable to send email: %v", err)

		// Ensure that the email is not sent infinitely by the retry mechanism
		if m.NextRetryAttempt == 0 && m.MaxRetryAttempts > models.MAIL_RETRY_NEVER {
			m.NextRetryAttempt = 1
			m.AddToQueue(db)
			fmt.Printf("Adding email to resend queue: %++v", m)
		}
		return err
	}

	return nil
}

func MailRemoveAllEmails() {
	url := fmt.Sprintf("http://%s:8025/api/v1/messages", Config.SMTP_HOST)
	req, _ := http.NewRequest(http.MethodDelete, url, nil)
	_, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
		return
	}
}

func mailSendByBrevoApi(m *models.Mail) error {
	postBody, _ := json.Marshal(map[string]any{
		"sender": map[string]any{
			"name":  m.SenderName,
			"email": m.SenderAddress,
		},
		"to": []map[string]any{{
			"name":  m.ToName,
			"email": m.ToAddress,
		}},
		"subject":     m.Subject,
		"htmlContent": m.Body,
	})
	responseBody := bytes.NewBuffer(postBody)
	req, err := http.NewRequest(http.MethodPost, "https://api.brevo.com/v3/smtp/email", responseBody)
	if err != nil {
		return err
	}

	req.Header = http.Header{
		"accept":       {"application/json"},
		"api-key":      {Config.SENDINBLUE_API_KEY},
		"content-type": {"application/json"},
	}

	_, err = http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	return nil
}

func mailSendBySmtp(m *models.Mail) error {
	gm := gomail.NewMsg()

	from := mail.Address{
		Name:    m.SenderName,
		Address: m.SenderAddress,
	}
	to := mail.Address{
		Name:    m.ToName,
		Address: m.ToAddress,
	}

	gm.From(from.String())
	gm.AddTo(to.String())
	gm.Subject(m.Subject)
	gm.SetBodyString(gomail.TypeTextHTML, m.Body)

	return smtpClient.DialAndSend(gm)
}
