package controllers

import (
	"fmt"
	"net/http"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"gorm.io/gorm"
)

func oneSignalCreateNotification(c *gin.Context, db *gorm.DB, userUIDs []string, notificationTitle, notificationSubtitle *onesignal.StringMap) bool {
	if len(userUIDs) == 0 {
		c.AbortWithError(http.StatusNoContent, fmt.Errorf("No users to send a notification to"))
		return false
	}

	headings := onesignal.NullableStringMap{}
	subtle := onesignal.NullableStringMap{}
	if notificationTitle != nil {
		headings.Set(notificationTitle)
		if notificationSubtitle != nil {
			subtle.Set(notificationSubtitle)
		}
	}

	auth := app.OneSignalGetAuth()
	_, _, err := app.OneSignalClient.DefaultApi.CreateNotification(auth).Notification(onesignal.Notification{
		Headings:               headings,
		Subtitle:               subtle,
		IncludeExternalUserIds: userUIDs,
	}).Execute()
	if err != nil {
		c.AbortWithError(http.StatusServiceUnavailable, err)
		return false
	}
	return true
}
