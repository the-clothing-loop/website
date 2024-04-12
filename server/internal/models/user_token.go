package models

import "time"

type UserToken struct {
	ID        uint
	Token     string
	Verified  bool
	UserID    uint
	CreatedAt time.Time
}
