package sharedtypes

type UserOnesignal struct {
	ID          uint
	PlayerID    string `gorm:"uniqueIndex"`
	OnesignalID string `gorm:"unique"`
	UserID      uint
}
