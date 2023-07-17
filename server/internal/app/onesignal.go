package app

import (
	"context"
	"fmt"

	"github.com/OneSignal/onesignal-go-api"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

var OneSignalClient *onesignal.APIClient

func OneSignalInit() {
	configuration := onesignal.NewConfiguration()
	OneSignalClient = onesignal.NewAPIClient(configuration)
}

func OneSignalGetAuth() context.Context {
	return context.WithValue(context.Background(), onesignal.AppAuth, Config.ONESIGNAL_REST_API_KEY)
}

func OneSignalCreateNotification(db *gorm.DB, userUIDs []string, notificationTitle, notificationContent onesignal.StringMap) error {
	if len(userUIDs) == 0 {
		return fmt.Errorf("No users to send a notification to")
	}

	notification := onesignal.NewNotification(Config.ONESIGNAL_APP_ID)
	notification.SetId(uuid.NewV4().String())
	notification.SetIncludeExternalUserIds(userUIDs)
	notification.SetIsAndroid(true)
	// TODO: Change when enabling notifications on IOS
	notification.SetIsIos(false)
	notification.SetIsAnyWeb(true)
	// notification.SetIncludedSegments([]string{"Subscribed Users"})
	notification.SetHeadings(notificationTitle)
	notification.SetContents(notificationContent)

	auth := OneSignalGetAuth()
	_, resp, err := OneSignalClient.DefaultApi.CreateNotification(auth).Notification(*notification).Execute()
	if err != nil {
		fmt.Printf("response error: %++v\n", resp)
		return err
	}
	return nil
}
