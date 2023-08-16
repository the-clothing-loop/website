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

	gomail "github.com/wneessen/go-mail"
)

var smtpClient *gomail.Client

type Mail struct {
	Sender  mail.Address
	To      mail.Address
	Subject string
	Body    string
}

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

func MailCreate() *Mail {
	m := &Mail{
		Sender: mail.Address{
			Name:    "The Clothing Loop",
			Address: Config.SMTP_SENDER,
		},
	}
	return m
}

func MailSend(m *Mail) error {
	if Config.ENV == EnvEnumAcceptance && strings.HasSuffix(m.To.Address, "@example.com") {
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

func mailSendByBrevoApi(m *Mail) error {
	// toJSON := []map[string]any{}
	// for _, t := range m.To {
	// 	toJSON = append(toJSON, map[string]any{
	// 	})
	// }

	postBody, _ := json.Marshal(map[string]any{
		"sender": map[string]any{
			"name":  m.Sender.Name,
			"email": m.Sender.Address,
		},
		"to": []map[string]any{{
			"name":  m.To.Name,
			"email": m.To.Address,
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

func mailSendBySmtp(m *Mail) error {
	gm := gomail.NewMsg()

	gm.From(m.Sender.String())
	gm.AddTo(m.To.String())
	gm.Subject(m.Subject)
	gm.SetBodyString(gomail.TypeTextHTML, m.Body)

	return smtpClient.DialAndSend(gm)
}
