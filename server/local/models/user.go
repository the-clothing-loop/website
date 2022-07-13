package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	UID             string `gorm:"uniqueIndex"`
	Email           string
	EmailVerified   bool
	Chains          []UserChainLL `gorm:"foreignKey:UserID"`
	Role            int
	Name            string
	PhoneNumber     string
	InterestedSizes []string `gorm:"serializer:json"`
	Address         string
	UserToken       []UserToken `gorm:"foreignKey:UserID"`
	Enabled         bool
}

const (
	RoleUser       = 1
	RoleChainAdmin = 2
	RoleAdmin      = 3
)

type UserToken struct {
	ID        uint
	UID       string `gorm:"uniqueIndex"`
	UserID    uint
	CreatedAt time.Time
}

type UserChainLL struct {
	ID         uint
	UserID     uint
	ChainID    uint
	ChainAdmin bool
}

func (u *User) GetChainUIDsByUserID(db *gorm.DB) (*[]string, error) {
	var results []struct{ UID string }
	db.Raw("SELECT chain.uid as uid FROM user_chain_ll JOIN chain ON user_chain_ll.chain_id = chain.id WHERE user_chain_ll.user_id = ?", u.ID).Scan(&results)

	if results == nil {
		return nil, fmt.Errorf("unable to look for chains related to user")
	}

	chainUIDs := []string{}
	for _, result := range results {
		chainUIDs = append(chainUIDs, result.UID)
	}

	return &chainUIDs, nil
}
