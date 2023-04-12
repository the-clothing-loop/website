package models

import (
	"fmt"

	"gorm.io/gorm"
)

type Bag struct {
	ID          uint   `json:"-"`
	Number      int    `json:"number"`
	Color       string `json:"color"`
	UserChainID uint   `json:"-"`
	ChainUID    string `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID     string `json:"user_uid" gorm:"-:migration;<-:false"`
}

// remove all bags related to this user from any loop
func (u *User) RemoveBagsAll(db *gorm.DB) error {
	err := db.Exec(`
DELETE FROM bags WHERE user_chain_id = NULL WHERE user_chain_id IN (
		SELECT id FROM user_chains WHERE user_id = ?
	)`, u.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bags from user: %v", err)
	}
	return nil
}

// remove all bags related to this user from a loop
func (c *Chain) RemoveBags(db *gorm.DB, userID uint) error {
	err := db.Exec(`
DELETE FROM bags WHERE user_chain_id = NULL WHERE user_chain_id IN (
		SELECT id FROM user_chains WHERE user_id = ? AND chain_id = ?
	)`, userID, c.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bags from user in loop: %v", err)
	}
	return nil
}

// remove all bags from a loop
func (c *Chain) RemoveBagsAll(db *gorm.DB) error {
	err := db.Exec(`
DELETE FROM bags WHERE user_chain_id = NULL WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE chain_id = ?
)`, c.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bags in loop: %v", err)
	}
	return nil
}
