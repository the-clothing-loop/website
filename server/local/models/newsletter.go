package models

import "time"

type Newsletter struct {
	ID        uint
	Email     string `gorm:"uniqueIndex"`
	Name      string
	CreatedAt time.Time
}
