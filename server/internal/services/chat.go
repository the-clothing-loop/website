package services

import (
	"log/slog"
	"time"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gorm.io/gorm"
)

type ChatSendMessageOptions struct {
	Message        string
	SendByUID      string
	ChainID        uint
	ChatChannelID  uint
	NotifyUserUIDs []string
}

func ChatSendMessage(db *gorm.DB, o ChatSendMessageOptions) error {
	chatMessage := sharedtypes.ChatMessage{
		Message:       o.Message,
		SendByUID:     o.SendByUID,
		ChatChannelID: o.ChatChannelID,
		CreatedAt:     time.Now().UnixMilli(),
	}
	err := db.Save(&chatMessage).Error
	if err != nil {
		return err
	}

	err = db.Exec(`UPDATE chat_channel SET last_message_at = NOW() WHERE id = ?`, o.ChatChannelID).Error
	if err != nil {
		return err
	}

	// send message to one signal
	userFindNotifyData, err := models.UserGetAllApprovedUserUIDsByChain(db, o.ChainID, o.NotifyUserUIDs)
	if err != nil {
		return err
	}

	go func(userUIDs []string, message string) {
		notificationMessage := lo.Ellipsis(message, 10)
		err = app.OneSignalCreateNotification(db, userUIDs, *views.Notifications[views.NotificationEnumTitleChatMessage], onesignal.StringMap{
			En: &notificationMessage,
		})
		if err != nil {
			slog.Error("Unable to send notification", "err", err)
		}
	}(userFindNotifyData, o.Message)

	return nil
}
