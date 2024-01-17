package services

import (
	"fmt"
	"strconv"

	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

func SendElapsedNotifications(db *gorm.DB) error {
	notifications, err := models.GetElapsedNotifications(db)
	if err != nil {
		return err
	}
	for _, notification := range notifications {
		if app.Config.ENV == app.EnvEnumDevelopment {
			fmt.Printf("OneSignal notification sent:\n\tTitle: %s\tContent: %s\n", notification.Title, notification.Content)
			continue
		}
		err := app.OneSignalCreateNotification(
			db,
			[]string{strconv.FormatUint(uint64(notification.UserID), 10)},
			*views.Notifications[notification.Title],
			*views.Notifications[notification.Content],
		)
		if err != nil {
			return err
		}
		err = notification.Delete(db)
		if err != nil {
			return err
		}
	}
	return nil
}
