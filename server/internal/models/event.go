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
	ChainID     zero.Int    `json:"-"`
	ChainUID    zero.String `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserID      uint        `json:"-"`
	CreatedAt   time.Time   `json:"-"`
	UpdatedAt   time.Time   `json:"-"`
	UserName    zero.String `json:"user_name" gorm:"-:migration;<-:false"`
	UserEmail   zero.String `json:"user_email" gorm:"-:migration;<-:false"`
	UserPhone   zero.String `json:"user_phone" gorm:"-:migration;<-:false"`
	ChainName   zero.String `json:"chain_name" gorm:"-:migration;<-:false"`
}

func (event *Event) LinkChain(db *gorm.DB, userID uint, chainID uint) error {
	return db.Exec(`
UPDATE events
SET chain_id = ?
WHERE id = ?
	`, chainID, event.ID, userID).Error
}

func (event *Event) UnlinkChain(db *gorm.DB, userID uint) error {
	return db.Exec(`
UPDATE events
SET chain_id = NULL
WHERE id = ?
	`, event.ID, userID).Error
}
