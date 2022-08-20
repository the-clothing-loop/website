package models

import (
	"fmt"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	UID             string `gorm:"uniqueIndex"`
	Email           string `gorm:"unique"`
	IsEmailVerified bool
	IsRootAdmin     bool
	Name            string
	PhoneNumber     string
	Address         string
	Sizes           []string `gorm:"serializer:json"`
	Genders         []string `gorm:"serializer:json"`
	Enabled         bool
	UserToken       []UserToken
	Chains          []UserChain
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
	ID           uint
	UserID       uint `gorm:"index"`
	ChainID      uint
	IsChainAdmin bool
}

type UserChainResponse struct {
	ChainUID     string `json:"chain_uid"`
	UserUID      string `json:"user_uid"`
	IsChainAdmin bool   `json:"is_chain_admin"`
}

// Use of an empty user with just the ID included is fine
//
// ```go
// user := &User{ID: id}
// user.GetChainUIDsAndIsAdminByUserID(db)
// ```
func (u *User) GetUserChainResponse(db *gorm.DB) (*[]UserChainResponse, error) {
	var results []UserChainResponse
	err := db.Raw(`
SELECT
	chains.uid AS chain_uid,
	users.uid AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id 
LEFT JOIN users ON user_chains.user_id = users.id 
WHERE user_chains.user_id = ?
	`, u.ID).Scan(&results).Error
	if err != nil {
		return nil, fmt.Errorf("unable to look for chains related to user")
	}

	return &results, nil
}

func (u *User) AddUserChainsToObject(db *gorm.DB) {
	userChains := []UserChain{}
	db.Raw(`
SELECT *
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id
WHERE user_chains.user_id = ?
	`, u.ID).Scan(&userChains)

	u.Chains = userChains
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	var sum int
	db.Raw(`
SELECT SUM(user_chains.id)
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id
WHERE user_chains.user_id = ?
	AND user_chains.chain_id = ?
	`, u.ID, chainID).Scan(&sum)
	return sum != 0
}
