package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type UserChain struct {
	ID           uint      `json:"-"`
	UserID       uint      `json:"-" gorm:"index"`
	UserUID      string    `json:"user_uid" gorm:"-:migration;<-:false"`
	ChainID      uint      `json:"-"`
	ChainUID     string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	IsChainAdmin bool      `json:"is_chain_admin"`
	CreatedAt    time.Time `json:"created_at"`
	IsApproved   bool      `json:"is_approved"`
	RouteOrder   int       `json:"-"`
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
