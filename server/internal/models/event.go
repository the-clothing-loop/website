package models

import (
	"time"

	"github.com/gin-gonic/gin"
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

func EventFindByUID(db *gorm.DB, uid string) (event *Event, err error) {
	event = &Event{}
	err = db.Raw(`SELECT * FROM events WHERE uid = ? LIMIT 1`, uid).Scan(event).Error
	if err != nil {
		return nil, err
	}

	return event, nil
}

func (event *Event) ResponseBody(db *gorm.DB) (body gin.H) {
	body = gin.H{
		"uid":         event.UID,
		"name":        event.Name,
		"description": event.Description,
		"latitude":    event.Latitude,
		"longitude":   event.Longitude,
		"address":     event.Address,
		"date":        event.Date,
		"genders":     event.Genders,
	}
	if event.ChainID.Valid {
		uid := ""
		db.Raw(`SELECT uid FROM chains WHERE id = ?`, event.ChainID.Int64).Scan(&uid)
		if uid != "" {
			body["chain_uid"] = uid
		}
	}

	return body
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
