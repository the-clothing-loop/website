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
	Admin           bool
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
	( chain.uid as ChainUID
	, user.uid as UserUID
	, user_chain_ll.chain_admin as ChainAdmin ) 
	FROM user_chain_ll
	JOIN chain ON user_chain_ll.chain_id = chain.id 
	JOIN user ON user_chain_ll.user_id = user.id 
	WHERE user_chain_ll.user_id = ?
	`, u.ID).Scan(results)

	if results == nil {
		return nil, fmt.Errorf("unable to look for chains related to user")
	}

	return results, nil
}

func (u *User) AddUserChainsLLToObject(db *gorm.DB) {
	userChainLL := []UserChainLL{}
	db.Raw(`
	SELECT
	( user_chain_ll.id as ID
	, user_chain_ll.user_id as UserID
	, user_chain_ll.chain_id as ChainID
	, user_chain_ll.chain_admin as ChainAdmin )
	FROM user_chain_ll
	JOIN user ON user_chain_ll.user_id = user.id
	WHERE user.id = ?
	`).Scan(userChainLL)

	u.Chains = userChainLL
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	res := db.Exec(`
	SELECT 
	(id)
	FROM user_chain_ll
	JOIN user ON user_chain_ll.user_id = user.id
	WHERE user_chain_ll.user_id = ?
		AND user_chain_ll.chain_id = ?
	`, u.ID, chainID)
	return res.Error == nil
}
