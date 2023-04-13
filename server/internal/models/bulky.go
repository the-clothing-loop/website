package models

import (
	"time"

	"gopkg.in/guregu/null.v3/zero"
)

type Bulky struct {
	ID          uint        `json:"id"`
	Title       string      `json:"title"`
	Message     string      `json:"message"`
	ImageUrl    zero.String `json:"image_url"`
	UserChainID uint        `json:"-"`
	ChainUID    string      `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID     string      `json:"user_uid" gorm:"-:migration;<-:false"`
	CreatedAt   time.Time   `json:"created_at"`
}
