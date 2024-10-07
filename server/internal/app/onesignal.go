package app

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"strings"

	"github.com/OneSignal/onesignal-go-api"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// type OneSignalErrorResponse struct {
// 	Errors   []string          `json:"errors,omitempty"`
// 	Warnings map[string]string `json:"warnings,omitempty"`
// }

// // {"errors":["Option Metadata must not exceed 3500 bytes.","Data Data must be no more than 2048 bytes long","Option Message in English language is too long to send to an iOS device. You can either make the content shorter or shorten or remove the other options."],"warnings":{"invalid_external_user_ids":"The following external_ids have unsubscribed subscriptions
// //  attached: [
// func (e OneSignalErrorResponse) GetInvalidExternalUserIds() []string {
// 	for _, warning := range e.Warnings {
// 		warning
// 	}
// }

var OneSignalClient *onesignal.APIClient

func OneSignalInit() {
	configuration := onesignal.NewConfiguration()
	OneSignalClient = onesignal.NewAPIClient(configuration)
}

func oneSignalGetAuth() context.Context {
	return context.WithValue(context.Background(), onesignal.AppAuth, Config.ONESIGNAL_REST_API_KEY)
}

func OneSignalCreateNotification(db *gorm.DB, userUIDs []string, notificationTitle, notificationContent onesignal.StringMap) error {
	if OneSignalClient == nil {
		return nil
	}
	if len(userUIDs) == 0 {
		return fmt.Errorf("No users to send a notification to")
	}

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
