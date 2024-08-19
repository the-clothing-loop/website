package models

import (
	"strings"
	"time"

	"gopkg.in/guregu/null.v3/zero"
)

type Bag struct {
	ID                    uint      `json:"id"`
	Number                string    `json:"number"`
	Color                 string    `json:"color"`
	UserChainID           uint      `json:"-"`
	ChainUID              string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID               string    `json:"user_uid" gorm:"-:migration;<-:false"`
	UpdatedAt             time.Time `json:"updated_at"`
	LastNotifiedAt        zero.Time `json:"-"`
	LastUserEmailToUpdate string    `json:"-"`
}

func (b *Bag) AddLastUserEmailToUpdateFifo(email string) {
	if email == "" {
		return
	}
	list := []string{}
	if b.LastUserEmailToUpdate != "" {
		list = strings.Split(b.LastUserEmailToUpdate, ",")
	}

	if len(list) > 0 {
		if email == list[len(list)-1] {
			// Last user email is already there as the last updated user
			return
		}
	}

	// only keeps 3 emails in total, this remove the oldest
	if len(list) >= 3 {
		list = list[len(list)-2:]
	}

	list = append(list, email)

	b.LastUserEmailToUpdate = strings.Join(list, ",")
}
