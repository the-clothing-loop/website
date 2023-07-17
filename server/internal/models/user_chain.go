package models

import (
	"errors"
	"fmt"
	"time"

	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

type UserChain struct {
	ID                         uint        `json:"-"`
	UserID                     uint        `json:"-" gorm:"index"`
	UserUID                    string      `json:"user_uid" gorm:"-:migration;<-:false"`
	ChainID                    uint        `json:"-"`
	ChainUID                   string      `json:"chain_uid" gorm:"-:migration;<-:false"`
	IsChainAdmin               bool        `json:"is_chain_admin"`
	CreatedAt                  time.Time   `json:"created_at"`
	IsApproved                 bool        `json:"is_approved"`
	LastNotifiedIsUnapprovedAt zero.Time   `json:"-"`
	RouteOrder                 int         `json:"-"`
	Bags                       []Bag       `json:"-"`
	Bulky                      []BulkyItem `json:"-"`
}

var ErrRouteInvalid = errors.New("Invalid route")

func ValidateAllRouteUserUIDs(db *gorm.DB, chainID uint, userUIDs []string) bool {
	lengthIn := len(userUIDs)
	lengthOut := -1
	err := db.Raw(`
SELECT COUNT(*) FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE uc.chain_id = ? AND uc.user_id IN ?`, chainID, userUIDs).Scan(&lengthOut).Error
	if err != nil {
		return false
	}

	return lengthIn == lengthOut
}

func (u *User) DeleteUserChainDependencies(db *gorm.DB, chainID uint) (err error) {
	tx := db.Begin()

	err = tx.Exec(`
DELETE FROM bags WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ? AND chain_id = ?
)
	`, u.ID, chainID).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("Unable to delete bags from user in loop: %v", err)
	}

	err = tx.Exec(`
DELETE FROM bulky_items WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ? AND chain_id = ?
)
	`, u.ID, chainID).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("Unable to delete bags from user in loop: %v", err)
	}

	return tx.Commit().Error
}

func (u *User) DeleteUserChainDependenciesAllChains(db *gorm.DB) (err error) {
	err = db.Exec(`
DELETE FROM bags WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ?
)
	`, u.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bulky items from user: %v", err)
	}

	err = db.Exec(`
DELETE FROM bulky_items WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ?
)
	`, u.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bulky items from user: %v", err)
	}

	return nil
}
