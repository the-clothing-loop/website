package models

import (
	"errors"
	"time"

	"gopkg.in/guregu/null.v3/zero"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("User not found")

type User struct {
	ID              uint        `json:"-"`
	UID             string      `json:"uid" gorm:"uniqueIndex"`
	FID             zero.String `json:"-" gorm:"column:fid"`
	Email           zero.String `json:"email" gorm:"unique"`
	IsEmailVerified bool        `json:"is_email_verified"`
	IsRootAdmin     bool        `json:"is_root_admin"`
	Name            string      `json:"name"`
	PhoneNumber     string      `json:"phone_number"`
	Address         string      `json:"address"`
	Sizes           []string    `json:"sizes" gorm:"serializer:json"`
	Enabled         bool        `json:"enabled"`
	LastSignedInAt  zero.Time   `json:"-"`
	UserToken       []UserToken `json:"-"`
	Chains          []UserChain `json:"chains"`
	CreatedAt       time.Time   `json:"-"`
	UpdatedAt       time.Time   `json:"-"`
}

const (
	RoleUser       = 1
	RoleChainAdmin = 2
	RoleRootAdmin  = 3
)

type UserToken struct {
	ID        uint
	Token     string `gorm:"unique"`
	Verified  bool
	UserID    uint
	CreatedAt int64
}

type UserChain struct {
	ID           uint      `json:"-"`
	UserID       uint      `json:"-" gorm:"index"`
	UserUID      string    `json:"user_uid" gorm:"-:migration;<-:false"`
	ChainID      uint      `json:"-"`
	ChainUID     string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	IsChainAdmin bool      `json:"is_chain_admin"`
	CreatedAt    time.Time `json:"created_at"`
}

var ErrAddUserChainsToObject = errors.New("Unable to add associated loops to user")

func (u *User) AddUserChainsToObject(db *gorm.DB) error {
	userChains := []UserChain{}
	err := db.Raw(`
SELECT
	user_chains.id             AS id,
	user_chains.chain_id       AS chain_id,
	chains.uid                 AS chain_uid,
	user_chains.user_id        AS user_id,
	users.uid                  AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON user_chains.user_id = users.id
WHERE users.id = ?
	`, u.ID).Scan(&userChains).Error
	if err != nil {
		return err
	}

	u.Chains = userChains
	return nil
}

// This required user to have run AddUserChainsToObject before this
func (u *User) IsPartOfChain(chainUID string) (ok, isChainAdmin bool) {
	for _, c := range u.Chains {
		if c.ChainUID == chainUID {
			ok = true
			isChainAdmin = c.IsChainAdmin
			break
		}
	}

	return ok, isChainAdmin
}
