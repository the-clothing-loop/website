package models

import (
	"fmt"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	UID             string `gorm:"uniqueIndex"`
	Email           string `gorm:"unique"`
	EmailVerified   bool
	Admin           bool
	Name            string
	PhoneNumber     string
	InterestedSizes []string `gorm:"serializer:json"`
	Address         string
	Enabled         bool
	UserToken       []UserToken
	Chains          []UserChain
}

const (
	RoleUser       = 1
	RoleChainAdmin = 2
	RoleAdmin      = 3
)

type UserToken struct {
	ID        uint
	Token     string `gorm:"unique"`
	Verified  bool
	UserID    uint
	CreatedAt int64
}

type UserChain struct {
	ID         uint
	UserID     uint `gorm:"index"`
	ChainID    uint
	ChainAdmin bool
}

type UserChainLLJSON struct {
	ChainUID   string `json:"chain_uid"`
	UserUID    string `json:"user_uid"`
	ChainAdmin bool   `json:"is_chain_admin"`
}

// Use of an empty user with just the ID included is fine
//
// ```go
// user := &User{ID: id}
// user.GetChainUIDsAndIsAdminByUserID(db)
// ```
func (u *User) GetUserChainLLJSON(db *gorm.DB) (*[]UserChainLLJSON, error) {
	var results *[]UserChainLLJSON
	db.Raw(`SELECT
	( chains.uid as ChainUID
	, users.uid as UserUID
	, user_chains.chain_admin as ChainAdmin ) 
	FROM user_chains
	JOIN chains ON user_chains.chain_id = chains.id 
	JOIN users ON user_chains.user_id = users.id 
	WHERE user_chains.user_id = ?
	`, u.ID).Scan(results)

	if results == nil {
		return nil, fmt.Errorf("unable to look for chains related to user")
	}

	return results, nil
}

func (u *User) AddUserChainsLLToObject(db *gorm.DB) {
	userChainLL := []UserChain{}
	db.Raw(`
	SELECT
	( user_chains.id as ID
	, user_chains.user_id as UserID
	, user_chains.chain_id as ChainID
	, user_chains.chain_admin as ChainAdmin )
	FROM user_chains
	JOIN users ON user_chains.user_id = users.id
	WHERE users.id = ?
	`).Scan(&userChainLL)

	u.Chains = userChainLL
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	res := db.Exec(`
	SELECT 
	(id)
	FROM user_chains
	JOIN users ON user_chains.user_id = users.id
	WHERE user_chains.user_id = ?
		AND user_chains.chain_id = ?
	`, u.ID, chainID)
	return res.Error == nil
}
