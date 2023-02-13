package models

import (
	"errors"
	"time"

	"gopkg.in/guregu/null.v3/zero"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("User not found")
var ErrAddUserChainsToObject = errors.New("Unable to add associated loops to user")

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
	LastSignedInAt  zero.Time   `json:"-"`
	UserToken       []UserToken `json:"-"`
	Chains          []UserChain `json:"chains"`
	CreatedAt       time.Time   `json:"-"`
	UpdatedAt       time.Time   `json:"-"`
}

func (u *User) AddUserChainsToObject(db *gorm.DB) error {
	userChains := []UserChain{}
	err := db.Raw(`
SELECT
	user_chains.id             AS id,
	user_chains.chain_id       AS chain_id,
	chains.uid                 AS chain_uid,
	user_chains.user_id        AS user_id,
	users.uid                  AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin,
	user_chains.created_at     AS created_at,
	user_chains.is_approved    AS is_approved
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

// This required user to have run AddUserChainsToObject before this
func (u *User) IsAnyChainAdmin() (isAnyChainAdmin bool) {
	for _, c := range u.Chains {
		if c.IsChainAdmin {
			isAnyChainAdmin = c.IsChainAdmin
			break
		}
	}

	return isAnyChainAdmin
}
