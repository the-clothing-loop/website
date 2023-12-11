package models

import (
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DebouncedNotification struct {
	UserID      uint   `gorm:"uniqueIndex:user_notification_index"`
	Title       string `gorm:"uniqueIndex:user_notification_index"`
	Content     string
	UpdatedAt   time.Time
	WaitMinutes uint
}

func GetElapsedNotifications(db *gorm.DB) ([]DebouncedNotification, error) {
	var notifications []DebouncedNotification
	err := db.Raw(
		`SELECT * FROM debounced_notifications WHERE updated_at < DATE_SUB( NOW(), INTERVAL wait_minutes MINUTE )`,
	).Scan(&notifications).Error
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

func AddNotification(db *gorm.DB, notification DebouncedNotification) error {
	return db.Clauses(clause.OnConflict{UpdateAll: true}).Create(&notification).Error
}

func (n *DebouncedNotification) Delete(db *gorm.DB) error {
	return db.Exec(`DELETE FROM debounced_notifications WHERE title = ? and user_id = ?`, n.Title, n.UserID).Error
}
