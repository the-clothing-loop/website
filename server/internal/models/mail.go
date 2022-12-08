package models

import (
	"time"

	"gopkg.in/guregu/null.v3/zero"
)

type Mail struct {
	ID        uint
	FID       zero.String `gorm:"column:fid"`
	To        string
	Subject   string
	Body      string
	Error     zero.String
	CreatedAt time.Time
}
