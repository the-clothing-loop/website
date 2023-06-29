package models

import (
	"time"

	"gopkg.in/guregu/null.v3/zero"
)

type Bag struct {
	ID             uint      `json:"id"`
	Number         string    `json:"number"`
	Color          string    `json:"color"`
	UserChainID    uint      `json:"-"`
	ChainUID       string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID        string    `json:"user_uid" gorm:"-:migration;<-:false"`
	UpdatedAt      time.Time `json:"updated_at"`
	LastNotifiedAt zero.Time `json:"-"`
}
