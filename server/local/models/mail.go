package models

import (
	"time"
)

type Mail struct {
	ID        uint
	FID       string
	To        string
	Subject   string
	Body      string
	Error     string
	CreatedAt time.Time
}
