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
	Admin           bool
	Name            string
	PhoneNumber     string
	InterestedSizes []string `gorm:"serializer:json"`
	Address         string
	Enabled         bool
	UserToken       []UserToken
	Chains          []UserChainLL
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
	( chains.uid as ChainUID
	, users.uid as UserUID
	, user_chain_lls.chain_admin as ChainAdmin ) 
	FROM user_chain_lls
	JOIN chains ON user_chain_lls.chain_id = chains.id 
	JOIN users ON user_chain_lls.user_id = users.id 
	WHERE user_chain_lls.user_id = ?
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
	( user_chain_lls.id as ID
	, user_chain_lls.user_id as UserID
	, user_chain_lls.chain_id as ChainID
	, user_chain_lls.chain_admin as ChainAdmin )
	FROM user_chain_lls
	JOIN users ON user_chain_lls.user_id = users.id
	WHERE users.id = ?
	`).Scan(userChainLL)

	u.Chains = userChainLL
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	res := db.Exec(`
	SELECT 
	(id)
	FROM user_chain_lls
	JOIN users ON user_chain_lls.user_id = users.id
	WHERE user_chain_lls.user_id = ?
		AND user_chain_lls.chain_id = ?
	`, u.ID, chainID)
	return res.Error == nil
}
