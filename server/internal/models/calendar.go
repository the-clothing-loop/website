package models

import "time"

type Calendar struct {
	ID          uint
	UID         string `gorm:"uniqueIndex"`
	Name        string
	Description string
	Latitude    float64
	Longitude   float64
	Date        time.Time
	Genders     []string `gorm:"serializer:json"`
	Published   bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
