package models

import (
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

var validate = validator.New()

var ErrChainNotFound = errors.New("Chain not found")

type Chain struct {
	ID               uint
	UID              string      `gorm:"uniqueIndex"`
	FID              zero.String `gorm:"column:fid"`
	Name             string
	Description      string
	Address          string
	Latitude         float64
	Longitude        float64
	Radius           float32
	Published        bool
	OpenToNewMembers bool
	Sizes            []string `gorm:"serializer:json"`
	Genders          []string `gorm:"serializer:json"`
	UserChains       []UserChain
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        zero.Time
}

func (c *Chain) SetRouteOrderByUserUIDs(db *gorm.DB, userUIDs []string) error {
	tx := db.Begin()
	for i := 0; i < len(userUIDs); i++ {
		userUID := userUIDs[i]
		err := tx.Exec(`
UPDATE user_chains SET route_order = ?
WHERE user_id IN (
	SELECT id FROM users
	WHERE uid = ?
)
AND is_approved = TRUE
AND chain_id = ? 
		`, i+1, userUID, c.ID).Error
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit().Error
}

func (c *Chain) GetRouteOrderByUserUID(db *gorm.DB) ([]string, error) {
	userUIDs := []string{}
	err := db.Raw(`
SELECT u.uid AS uid FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE uc.chain_id = ?
AND uc.is_approved = TRUE
ORDER BY uc.route_order ASC
	`, c.ID).Scan(&userUIDs).Error
	if err != nil {
		return nil, err
	}

	return userUIDs, nil
}
