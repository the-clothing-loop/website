package models

import "time"

type Mail struct {
	ID      uint
	To      string
	Message struct {
		Subject string
		Html    string
	} `gorm:"serializer:json"`
	Error     *string
	CreatedAt time.Time
}
