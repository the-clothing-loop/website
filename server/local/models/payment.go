package models

import "time"

type Payment struct {
	ID uint
	// Euro cents
	Amount      float32
	Email       string
	IsRecurring bool
	SessionID   string
	CreatedAt   time.Time
}
