package models

import (
	"time"
)

type BulkyItem struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	ImageUrl    string    `json:"image_url"`
	UserChainID uint      `json:"-"`
	ChainUID    string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID     string    `json:"user_uid" gorm:"-:migration;<-:false"`
	CreatedAt   time.Time `json:"created_at"`
}
