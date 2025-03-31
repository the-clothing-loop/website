package models

import (
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

var validate = validator.New()

var ErrChainNotFound = errors.New("Chain not found")

type Chain struct {
	ID                            uint
	UID                           string      `gorm:"uniqueIndex"`
	FID                           zero.String `gorm:"column:fid"`
	Name                          string
	Description                   string
	Address                       string
	CountryCode                   string
	Image                         *string
	Latitude                      float64
	Longitude                     float64
	Radius                        float32
	Published                     bool
	OpenToNewMembers              bool
	RulesOverride                 string
	HeadersOverride               string
	AllowMap                      bool
	Sizes                         []string `gorm:"serializer:json"`
	Genders                       []string `gorm:"serializer:json"`
	UserChains                    []sharedtypes.UserChain
	CreatedAt                     time.Time
	UpdatedAt                     time.Time
	DeletedAt                     zero.Time
	Theme                         string
	IsAppDisabled                 bool
	RoutePrivacy                  int
	LastAbandonedAt               sql.NullTime
	LastAbandonedRecruitmentEmail sql.NullTime
	ChatRoomIDs                   []string `gorm:"column:chat_room_ids;serializer:json"`
	ChatType                      string
	ChatUrl                       string
}

// Selects chain; id, uid, name, description, address, latitude, longitude, radius, sizes, genders, published, open_to_new_members
const ChainResponseSQLSelect = `SELECT chains.id,
chains.uid,
chains.name,
chains.description,
chains.address,
chains.image,
chains.latitude,
chains.longitude,
chains.radius,
chains.sizes,
chains.genders,
chains.published,
chains.open_to_new_members`

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
JOIN users AS u ON u.id = uc.user_id
WHERE uc.chain_id = ?
AND uc.is_approved = TRUE
ORDER BY uc.route_order ASC
	`, c.ID).Scan(&userUIDs).Error
	if err != nil {
		return nil, err
	}

	return userUIDs, nil
}

func (c *Chain) RemoveUserUnapproved(db *gorm.DB, userID uint) (err error) {
	tx := db.Begin()

	err = (&User{ID: userID}).DeleteUserChainDependencies(db, c.ID)
	if err != nil {
		tx.Rollback()
		return err
	}
	err = tx.Exec(`
DELETE FROM user_chains
WHERE user_id = ? AND chain_id = ? AND is_approved = FALSE
	`, userID, c.ID).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (c *Chain) RemoveUser(db *gorm.DB, userID uint) (err error) {
	tx := db.Begin()

	err = (&User{ID: userID}).DeleteUserChainDependencies(db, c.ID)
	if err != nil {
		tx.Rollback()
		return err
	}
	err = tx.Exec(`
DELETE FROM user_chains
WHERE user_id = ? AND chain_id = ?
	`, userID, c.ID).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (c *Chain) ClearAllLastNotifiedIsUnapprovedAt(db *gorm.DB) error {
	return db.Exec(`
	UPDATE user_chains
	SET last_notified_is_unapproved_at = NULL
	WHERE chain_id = ?
	`, c.ID).Error
}

func (c *Chain) Delete(db *gorm.DB) error {
	tx := db.Begin()
	var err error
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	err = tx.Exec(`DELETE FROM bags WHERE user_chain_id IN (
		SELECT id FROM user_chains WHERE chain_id = ?
	)`, c.ID).Error
	if err != nil {
		return err
	}

	err = tx.Exec(`DELETE FROM bulky_items WHERE user_chain_id IN (
		SELECT id FROM user_chains WHERE chain_id = ?
	)`, c.ID).Error
	if err != nil {
		return err
	}

	err = tx.Exec(`DELETE FROM user_chains WHERE chain_id = ?`, c.ID).Error
	if err != nil {
		return err
	}

	err = tx.Exec(`DELETE FROM chains WHERE id = ?`, c.ID).Error
	if err != nil {
		return err
	}

	tx.Commit()
	return nil
}

func ChainGetNamesByIDs(db *gorm.DB, chainIDs ...uint) ([]string, error) {

	type aux struct {
		Name string
	}
	results := []aux{}

	query := `SELECT chains.name FROM chains WHERE id IN ?`
	err := db.Raw(query, chainIDs).Find(&results).Error
	if err != nil {
		return nil, err
	}

	names := []string{}
	for _, v := range results {
		names = append(names, v.Name)
	}

	return names, nil
}

func (c *Chain) GetUserContactData(db *gorm.DB) ([]UserContactData, error) {
	users := []UserContactData{}
	err := db.Raw(`
SELECT
	u.name AS name,
	u.email AS email,
	u.i18n AS i18n,
	c.name AS chain_name,
	uc.is_approved as is_approved
FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
WHERE c.id = ?
	`, c.ID).Scan(&users).Error
	if err != nil {
		return nil, err
	}

	return users, nil
}

type ChainTotals struct {
	TotalMembers int `gorm:"total_members"`
	TotalHosts   int `gorm:"total_hosts"`
}

func (c *Chain) GetTotals(db *gorm.DB) *ChainTotals {
	result := &ChainTotals{}
	err := db.Raw(`
SELECT COUNT(uc1.id) AS total_members, (
	SELECT COUNT(uc2.id)
	FROM user_chains AS uc2
	WHERE uc2.chain_id = ? AND uc2.is_approved = TRUE AND uc2.is_chain_admin = TRUE
	) AS total_hosts
FROM user_chains AS uc1
WHERE uc1.chain_id = ? AND uc1.is_approved = TRUE
	`, c.ID, c.ID).Scan(&result).Error
	if err != nil {
		panic(err)
	}

	return result
}

func ChainCheckIfExist(db *gorm.DB, ChainUID string, checkIfIsOpenToNewMembers bool) (chainID uint, found bool, err error) {
	var row struct {
		ID uint `gorm:"id"`
	}
	query := "SELECT id FROM chains WHERE uid = ? AND deleted_at IS NULL"
	if checkIfIsOpenToNewMembers {
		query += " AND open_to_new_members = TRUE"
	}
	query += " LIMIT 1"

	err = db.Raw(query, ChainUID).Scan(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, false, nil
		}

		return 0, false, err
	}

	return row.ID, true, nil
}

func (c *Chain) SaveChannelIDs(db *gorm.DB) error {
	b, err := json.Marshal(c.ChatRoomIDs)
	if err != nil {
		return err
	}
	return db.Exec(`UPDATE chains SET chat_room_ids = ? WHERE id = ?`, string(b), c.ID).Error
}

func (c *Chain) GetChatType(db *gorm.DB) (*sharedtypes.ChatGetTypeResponse, error) {
	res := &sharedtypes.ChatGetTypeResponse{}
	err := db.Raw(`SELECT chat_type, chat_url FROM chains WHERE id = ?`, c.ID).Scan(res).Error
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c *Chain) SaveChatType(db *gorm.DB, chatTypeUrl sharedtypes.ChatGetTypeResponse) error {
	return db.Exec(`UPDATE chains SET chat_type = ?, chat_url = ? WHERE id = ?`, chatTypeUrl.ChatType, chatTypeUrl.ChatUrl, c.ID).Error
}
