package models

import (
	"time"

	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

type Event struct {
	ID          uint
	UID         string `gorm:"uniqueIndex"`
	Name        string
	Description string
	Latitude    float64
	Longitude   float64
	Address     string
	Date        time.Time
	Genders     []string `gorm:"serializer:json"`
	ChainID     zero.Int
	UserEvents  []UserEvent
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (cal *Event) LinkChain(db *gorm.DB, userID uint, chainID uint) error {
	return db.Exec(`
UPDATE user_events
SET chain_id = ?
WHERE event_id = ? AND user_id = ?
	`, chainID, cal.ID, userID).Error
}

func (cal *Event) UnlinkChain(db *gorm.DB, userID uint) error {
	return db.Exec(`
UPDATE user_events
SET chain_id = NULL
WHERE event_id = ? AND user_id = ?
	`, cal.ID, userID).Error
}

func (cal *Event) GetConnectedUserUIDs(db *gorm.DB) (userUIDs *[]string, err error) {
	userUIDs = &[]string{}
	err = db.Raw(`
SELECT users.uid AS uid
FROM user_events AS ue
LEFT JOIN users ON ue.user_id = users.id
WHERE ue.event_id = ?
	`, cal.ID).Scan(userUIDs).Error
	if err != nil {
		return nil, err
	}

	return userUIDs, nil
}
