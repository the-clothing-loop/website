package models

import (
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gorm.io/gorm"
)

func ChatMessageGet(db *gorm.DB, id, channelID uint) (message *sharedtypes.ChatMessage, err error) {
	message = &sharedtypes.ChatMessage{}
	err = db.Raw("SELECT * FROM chat_messages WHERE id = ? AND chat_channel_id = ? AND deleted_at IS NULL LIMIT 1", id, channelID).Scan(message).Error
	if err != nil {
		return nil, err
	}
	return message, nil
}
