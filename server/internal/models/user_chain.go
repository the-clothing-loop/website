package models

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gorm.io/gorm"
)

var ErrRouteInvalid = errors.New("Invalid route")

func UserChainSetNote(db *gorm.DB, userID, chainID uint, note string) error {
	return db.Exec(`UPDATE user_chains SET note = ? WHERE user_id = ? AND chain_id = ?`, sql.NullString{Valid: note != "", String: note}, userID, chainID).Error
}
func UserChainGetNote(db *gorm.DB, userID, chainID uint) (string, error) {
	note := sql.NullString{}
	err := db.Raw(`SELECT note FROM user_chains WHERE user_id = ? AND chain_id = ?`, userID, chainID).Pluck("note", &note).Error
	if err != nil {
		return "", err
	}
	return note.String, nil
}

func UserChainSetWarden(db *gorm.DB, userID, chainID uint, warden bool) error {
	return db.Exec(`UPDATE user_chains SET is_chain_warden = ? WHERE user_id = ? AND chain_id = ?`, warden, userID, chainID).Error
}

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

func (u *User) DeleteOrPassOnUserChainBags(db *gorm.DB, chainID uint) (err error) {
	// List bags
	bags := []struct {
		ID          uint
		UserChainID uint
	}{}
	err = db.Raw(`
SELECT id, user_chain_id FROM bags WHERE user_chain_id IN (
	SELECT id from user_chains WHERE user_id = ?	AND chain_id = ?
)`, u.ID, chainID).Scan(&bags).Error
	if err != nil {
		return fmt.Errorf("Error to selecting bags: %v", err)
	}

	// Pass on bag to other host if possible, otherwise stay put
	errs := []error{}
	for _, bag := range bags {
		err := db.Exec(`
UPDATE bags SET user_chain_id = (
	SELECT uc.id FROM user_chains AS uc
	WHERE uc.is_chain_admin IS TRUE
		AND uc.is_approved IS TRUE
		AND uc.chain_id = ?
	ORDER BY
		uc.user_id != ? DESC,
		uc.user_id
	LIMIT 1
) WHERE id = ?`, chainID, u.ID, bag.ID).Error
		if err != nil {
			errs = append(errs, err)
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("One or more bags where unable to be passed along to another host: %v", errs)
	}

	err = db.Exec(`
DELETE FROM bags WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = ? AND chain_id = ?
)
	`, u.ID, chainID).Error
	if err != nil {
		return fmt.Errorf("Unable to delete bags: %v", err)
	}

	return nil
}

func (u *User) DeleteUserChainDependencies(db *gorm.DB, chainID uint) (err error) {
	tx := db.Begin()

	err = u.DeleteOrPassOnUserChainBags(tx, chainID)
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
	for _, uc := range u.Chains {
		err = u.DeleteOrPassOnUserChainBags(db, uc.ChainID)
		if err != nil {
			return err
		}
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

func UserChainGetIndirectByChain(db *gorm.DB, chainID uint) ([]sharedtypes.UserChain, error) {
	results := []sharedtypes.UserChain{}

	err := db.Raw(`
	SELECT
		user_chains.id             AS id,
		user_chains.chain_id       AS chain_id,
		chains.uid                 AS chain_uid,
		user_chains.user_id        AS user_id,
		users.uid                  AS user_uid,
		user_chains.is_chain_admin AS is_chain_admin,
		user_chains.is_chain_warden AS is_chain_warden,
		user_chains.created_at     AS created_at,
		user_chains.is_paused      AS is_paused,
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

func UserChainCheckIfRelationExist(db *gorm.DB, ChainID uint, UserID uint, checkIfIsApproved bool) (userChainID uint, found bool, err error) {
	var row struct {
		ID uint `gorm:"id"`
	}
	query := "SELECT id FROM user_chains WHERE chain_id = ? AND user_id = ?"

	if checkIfIsApproved {
		query += " AND is_approved = TRUE"
	}
	query += " LIMIT 1"

	err = db.Raw(query, ChainID, UserID).First(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, false, nil
		}
		return 0, false, err
	}

	return row.ID, true, nil
}
