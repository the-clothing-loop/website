package models

import (
	"fmt"
	"time"

	"gopkg.in/guregu/null.v3"
	"gorm.io/gorm"
)

const (
	MAIL_RETRY_NEVER    = 0
	MAIL_RETRY_NEXT_DAY = 1
	MAIL_RETRY_TWO_DAYS = 2
)

type Mail struct {
	ID               uint
	SenderName       string
	SenderAddress    string
	ToName           string
	ToAddress        string
	Subject          string
	Body             string
	Err              null.String
	MaxRetryAttempts int
	NextRetryAttempt int
	CreatedAt        time.Time
}

func (m Mail) TableName() string {
	return "mail_retries"
}

func (m *Mail) AddToQueue(db *gorm.DB) error {
	return db.Create(m).Error
}

func (m *Mail) UpdateNextRetryAttempt(db *gorm.DB, err error) error {
	m.NextRetryAttempt += 1
	if m.NextRetryAttempt >= m.MaxRetryAttempts+1 || err == nil {
		return db.Exec(`UPDATE mail_retries SET next_retry_attempt = 0 WHERE id = ?`, m.ID).Error
	}

	newErr := err.Error()
	if m.Err.Valid {
		newErr = fmt.Sprintf("%s, %s", newErr, m.Err.String)
	}
	return db.Exec(`
UPDATE mail_retries
SET next_retry_attempt = ?, err = ?
WHERE id = ?
	`, m.NextRetryAttempt, newErr, m.ID).Error
}

func MailGetDueForResend(db *gorm.DB) ([]*Mail, error) {
	mails := []*Mail{}
	err := db.Raw(`
SELECT * FROM mail_retries
WHERE (next_retry_attempt = 1 AND created_at < (NOW() - INTERVAL 15 HOUR))
	OR (next_retry_attempt = 2 AND created_at < (NOW() - INTERVAL 2 DAY))
	OR (next_retry_attempt = 3 AND created_at < (NOW() - INTERVAL 3 DAY))
	`).Scan(&mails).Error
	if err != nil {
		return nil, err
	}

	return mails, nil
}
