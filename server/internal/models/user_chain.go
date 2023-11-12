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
	// TODO: send notification to host
	// give away bags to the next host
	err = db.Exec(`
UPDATE bags AS b
SET user_chain_id = (
	SELECT uc.id FROM user_chains AS uc
	WHERE uc.is_chain_admin IS TRUE
		AND uc.is_approved IS TRUE
		AND uc.chain_id = (
			SELECT uc2.chain_id FROM user_chains AS uc2
			WHERE uc2.id = b.user_chain_id
		)
	ORDER BY
     uc.user_id != ? DESC,
     uc.user_id
	LIMIT 1
)
WHERE b.user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ?
)
	`, u.ID, u.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to give away connected bags from user: %v", err)
	}

	// delete other bags unable to give away
	err = db.Exec(`
DELETE FROM bags WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ?
)
	`, u.ID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bulky items from user: %v", err)
	}

	// delete bulky items from user
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

func UserChainGetIndirectByChain(db *gorm.DB, chainID uint) ([]UserChain, error) {
	results := []UserChain{}

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
	WHERE users.id IN (
		SELECT user_chains.user_id
		FROM user_chains
		LEFT JOIN chains ON chains.id = user_chains.chain_id
		WHERE chains.id = ?
	)	
	`, chainID).Scan(&results).Error

	if err != nil {
		return nil, err
	}
	return results, nil
}

func UserChainCheckIfRelationExist(db *gorm.DB, ChainID uint, UserID uint, checkIfIsApproved bool) (uint, error) {
	var row struct {
		ID uint `gorm:"id"`
	}
	query := "SELECT id FROM user_chains WHERE chain_id = ? AND user_id = ?"

	if checkIfIsApproved {
		query += " AND is_approved = TRUE"
	}
	query += " LIMIT 1"

	err := db.Raw(query, ChainID, UserID).First(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, nil
		}
		return 0, err
	}

	return row.ID, nil
}
