package models

import "time"

type UserToken struct {
	ID        uint
	Token     string `gorm:"unique"`
	Verified  bool
	UserID    uint
	CreatedAt time.Time
}
