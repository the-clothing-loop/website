package models

import (
	"time"
)

type Mail struct {
	ID        uint
	To        string
	Subject   string
	Body      string
	Error     string
	CreatedAt time.Time
}
