package models

import "time"

type Payment struct {
	ID          uint
	Amount      float32
	Email       string
	IsRecurring bool
	SessionID   string
	CreatedAt   time.Time
}
