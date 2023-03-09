package models

import (
	"time"

	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

type Event struct {
	ID          uint        `json:"-"`
	UID         string      `gorm:"uniqueIndex" json:"uid"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Latitude    float64     `json:"latitude"`
	Longitude   float64     `json:"longitude"`
	Address     string      `json:"address"`
	Date        time.Time   `json:"date"`
	Genders     []string    `gorm:"serializer:json" json:"genders"`
	ChainID     zero.Int    `json:"chain_id,omitempty"`
	UserEvents  []UserEvent `json:"-"`
	CreatedAt   time.Time   `json:"-"`
	UpdatedAt   time.Time   `json:"-"`
}

func EventFindByUID(db *gorm.DB, uid string) (event *Event, err error) {
	event = &Event{}
	err = db.Raw(`SELECT * FROM events WHERE uid = ? LIMIT 1`, uid).Scan(event).Error
	if err != nil {
		return nil, err
	}

	return event, nil
}

func (event *Event) LinkChain(db *gorm.DB, userID uint, chainID uint) error {
	return db.Exec(`
UPDATE user_events
SET chain_id = ?
WHERE event_id = ? AND user_id = ?
	`, chainID, event.ID, userID).Error
}

func (event *Event) UnlinkChain(db *gorm.DB, userID uint) error {
	return db.Exec(`
UPDATE user_events
SET chain_id = NULL
WHERE event_id = ? AND user_id = ?
	`, event.ID, userID).Error
}

func (event *Event) GetConnectedUserUIDs(db *gorm.DB) (userUIDs *[]string, err error) {
	userUIDs = &[]string{}
	err = db.Raw(`
SELECT users.uid AS uid
FROM user_events AS ue
LEFT JOIN users ON ue.user_id = users.id
WHERE ue.event_id = ?
	`, event.ID).Scan(userUIDs).Error
	if err != nil {
		return nil, err
	}

	return userUIDs, nil
}
