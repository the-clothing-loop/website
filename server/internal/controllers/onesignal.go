package controllers

import (
	"fmt"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"github.com/the-clothing-loop/website/server/internal/app"
	"gorm.io/gorm"
)

func oneSignalCreateNotification(c *gin.Context, db *gorm.DB, userUIDs []string, notificationTitle, notificationContent onesignal.StringMap) error {
	if len(userUIDs) == 0 {
		return fmt.Errorf("No users to send a notification to")
	}

	notification := onesignal.NewNotification(app.Config.ONESIGNAL_APP_ID)
	notification.SetId(uuid.NewV4().String())
	notification.SetIncludeExternalUserIds(userUIDs)
	notification.SetIsAndroid(true)
	// TODO: Change when enabling notifications on IOS
	notification.SetIsIos(false)
	notification.SetIsAnyWeb(true)
	// notification.SetIncludedSegments([]string{"Subscribed Users"})
	notification.SetHeadings(notificationTitle)
	notification.SetContents(notificationContent)

	auth := app.OneSignalGetAuth()
	_, resp, err := app.OneSignalClient.DefaultApi.CreateNotification(auth).Notification(*notification).Execute()
	if err != nil {
		fmt.Printf("response error: %++v\n", resp)
		return err
	}
	return nil
}
