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

func (u *User) AddUserChainsLLToObject(db *gorm.DB) {
	userChainLL := []UserChain{}
	db.Raw(`
SELECT *
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id
WHERE user_chains.user_id = ?
	`, u.ID).Scan(&userChainLL)

	u.Chains = userChainLL
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	res := db.Exec(`
SELECT (id)
FROM user_chains
JOIN users ON user_chains.user_id = users.id
WHERE user_chains.user_id = ?
	AND user_chains.chain_id = ?
	`, u.ID, chainID)
	return res.Error == nil
}
