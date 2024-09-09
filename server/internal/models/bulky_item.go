package models

import (
	"time"

	"gorm.io/gorm"
)

type BulkyItem struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	ImageUrl    string    `json:"image_url"`
	UserChainID uint      `json:"-"`
	ChainUID    string    `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserUID     string    `json:"user_uid" gorm:"-:migration;<-:false"`
	CreatedAt   time.Time `json:"created_at"`
}

func GetAllBulkyItemsByChain(db *gorm.DB, chainID uint) ([]BulkyItem, error) {
	res := []BulkyItem{}
	err := db.Raw(`
SELECT * FROM bulky_items
WHERE user_chain_id IN (
	SELECT UNIQUE(chain_id) FROM user_chains
	WHERE chain_id = ?
)
	`, chainID).Scan(&res).Error
	if err != nil {
		return nil, err
	}
	return res, nil
}

func RemoveSelectedBulkyItems(db *gorm.DB, bulkyItems []BulkyItem) error {
	bulkyItemIDs := []uint{}
	for _, bulkyItem := range bulkyItems {
		bulkyItemIDs = append(bulkyItemIDs, bulkyItem.ID)
	}
	return db.Exec("DELETE FROM bulky_items WHERE id IN ?", bulkyItemIDs).Error
}
