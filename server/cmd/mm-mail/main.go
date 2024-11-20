package main

import (
	"bytes"
	"fmt"
	"log/slog"
	"net"
	"net/mail"
	"os"
	"strings"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/mhale/smtpd"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	os.Setenv("SERVER_NO_MIGRATE", "true")
	app.ConfigInit(".")

	if app.Config.ENV == app.EnvEnumDevelopment {
		slog.SetLogLoggerLevel(slog.LevelDebug)
	} else {
		slog.SetLogLoggerLevel(slog.LevelWarn)
	}
	fmt.Printf("env: %s\n", app.Config.ENV)
	app.OneSignalInit()
	db = app.DatabaseInit()

	addr := fmt.Sprintf("%s:%s", app.Config.MM_SMTP_HOST, app.Config.MM_SMTP_PORT)
	smtpd.ListenAndServe(addr, mailHandler, "MyServerApp", "")
}

func mailHandler(origin net.Addr, from string, to []string, data []byte) error {
	msg, _ := mail.ReadMessage(bytes.NewReader(data))
	subject := msg.Header.Get("Subject")
	if len(to) == 0 {
		return nil
	}
	slog.Debug("Email received", "to", to, "subject", subject)
	if strings.Contains(subject, "New Notification") {
		username, err := models.UserChatEmailToChatUserName(to[0])
		if err != nil {
			slog.Error("Unable to find user account by email", "err", err)
			return nil
		}
		user, err := models.UserGetByChatUserName(db, *username)
		if err != nil {
			slog.Error("Unable to find user account by email", "err", err)
			return nil
		}

		err = app.OneSignalCreateNotification(db, []string{user.UID}, *views.Notifications[views.NotificationEnumTitleChatMessage], onesignal.StringMap{})
		if err != nil {
			slog.Error("Unable to send notification", "err", err)
		}
	}
	return nil
}
