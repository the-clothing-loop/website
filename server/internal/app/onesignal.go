package app

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"regexp"
	"strings"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/cdfmlr/ellipsis"
	"github.com/samber/lo"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type OneSignalErrorResponse struct {
	Errors   []string          `json:"errors,omitempty"`
	Warnings map[string]string `json:"warnings,omitempty"`
}

// {"errors":["Option Metadata must not exceed 3500 bytes.","Data Data must be no more than 2048 bytes long","Option Message in English language is too long to send to an iOS device. You can either make the content shorter or shorten or remove the other options."],"warnings":{"invalid_external_user_ids":"The following external_ids have unsubscribed subscriptions
//
//	attached: [
var oneSignalReErr = regexp.MustCompile(`\[("[\w-]*",?\s*)*\]`)

func (e OneSignalErrorResponse) GetInvalidExternalUserIds() []string {
	for k, v := range e.Warnings {
		if k == "invalid_external_user_ids" {
			s := oneSignalReErr.FindString(v)
			arr := []string{}
			fmt.Printf("%v: %v\n", k, v)
			fmt.Printf("%s", s)
			json.Unmarshal([]byte(s), &arr)
			return arr
		}
	}
	return []string{}
}

var OneSignalClient *onesignal.APIClient

func OneSignalInit() {
	configuration := onesignal.NewConfiguration()
	OneSignalClient = onesignal.NewAPIClient(configuration)
}

func oneSignalGetAuth() context.Context {
	return context.WithValue(context.Background(), onesignal.AppAuth, Config.ONESIGNAL_REST_API_KEY)
}

const notificationUserLimit = 15

// Chunk notifications
func OneSignalCreateNotification(db *gorm.DB, userUIDs []string, notificationTitle, notificationContent onesignal.StringMap) error {
	if OneSignalClient == nil {
		return nil
	}
	lenUserUIDs := len(userUIDs)
	if lenUserUIDs == 0 {
		return fmt.Errorf("No users to send a notification to")
	}
	userUIDchunks := lo.Chunk(userUIDs, notificationUserLimit)

	for _, userUIDs := range userUIDchunks {
		err := oneSignalCreateNotificationSend(userUIDs, notificationTitle, notificationContent)
		if err != nil {
			return err
		}
	}
	return nil
}
func oneSignalCreateNotificationSend(userUIDs []string, notificationTitle, notificationContent onesignal.StringMap) error {
	notification := onesignal.NewNotification(Config.ONESIGNAL_APP_ID)
	notification.SetId(uuid.NewV4().String())
	notification.SetIncludeExternalUserIds(userUIDs)
	notification.SetIsAndroid(true)
	notification.SetIsIos(true)
	notification.SetIsAnyWeb(false)
	notification.SetHeadings(notificationTitle)
	notification.SetContents(notificationContent)
	notification.SetData(map[string]any{
		"user_uids": strings.Join(userUIDs, ","),
	})

	auth := oneSignalGetAuth()
	_, resp, err := OneSignalClient.DefaultApi.CreateNotification(auth).Notification(*notification).Execute()
	if err != nil {
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		fmt.Printf("response error: %s\n", string(body))
		slog.Error("Unable to send notification", "err", err)
		return err
	}
	return nil
}

func OneSignalEllipsisContent(content string) onesignal.StringMap {
	if content == "" {
		return onesignal.StringMap{}
	}

	content = ellipsis.Ending(content, 15)
	return onesignal.StringMap{
		En: onesignal.PtrString(content),
	}
}
