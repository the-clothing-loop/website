package models

import (
	"time"

	"gorm.io/gorm"
)

type Newsletter struct {
	ID        uint
	Email     string `gorm:"uniqueIndex"`
	Name      string
	Verified  bool
	CreatedAt time.Time
}

// This requires the following values to be populated: Email, Name, Verified
func (n *Newsletter) CreateOrUpdate(db *gorm.DB) error {
	if res := db.Create(n); res.Error != nil {
		res = db.Exec(`
UPDATE newsletter
SET name = ?, verified = ?
WHERE email = ?
		`, n.Name, n.Verified, n.Email)
		return res.Error
	}

	return nil
}
