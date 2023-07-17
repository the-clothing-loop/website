package models

import "gorm.io/gorm"

type UserOnesignal struct {
	ID          uint
	PlayerID    string `gorm:"uniqueIndex"`
	OnesignalID string `gorm:"unique"`
	UserID      uint
}

func UserOnesignalGetAllPlayerIDs(db *gorm.DB, userIDs []uint) ([]string, error) {
	onesignalIDs := []string{}
	err := db.Raw(`SELECT onesignal_id FROM user_onesignal WHERE user_id IN ?`, userIDs).Scan(&onesignalIDs).Error
	if err != nil {
		return nil, err
	}

	return onesignalIDs, nil
}

func UserOnesignalPut(db *gorm.DB, userID uint, onesignalID, playerID string) error {
	userOnesignal := &UserOnesignal{}
	db.Raw(`SELECT * FROM user_onesignal WHERE onesignal_id = ? LIMIT 1`, onesignalID).Scan(userOnesignal)

	userOnesignal.UserID = userID
	userOnesignal.OnesignalID = onesignalID
	userOnesignal.PlayerID = playerID

	return db.Save(userOnesignal).Error
}

func UserOnesignalDelete(db *gorm.DB, playerID string) error {
	return db.Exec(`DELETE FROM user_onesignal WHERE player_id = ?`, playerID).Error
}
