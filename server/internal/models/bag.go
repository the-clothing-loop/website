package models

import (
	"time"
)

type Bag struct {
	ID          uint      `json:"-"`
	Number      int       `json:"number"`
	Color       string    `json:"color"`
	UserChainID uint      `json:"-"`
	ChainUID    string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID     string    `json:"user_uid" gorm:"-:migration;<-:false"`
	UpdatedAt   time.Time `json:"updated_at"`
}
