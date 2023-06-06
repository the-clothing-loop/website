package app

import (
	"time"

	cron "github.com/go-co-op/gocron"
	"github.com/golang/glog"
	"gorm.io/gorm"
)

var Scheduler *cron.Scheduler

func CronInit(db *gorm.DB) {
	Scheduler := cron.NewScheduler(time.UTC)

	Scheduler.Cron("3 3 1 * *").Do(monthly, db)

	Scheduler.StartAsync()
	// // For testing
	// Scheduler.RunAllWithDelay(time.Duration(2) * time.Second)
}

func monthly(db *gorm.DB) {
	closeOldPendingParticipants(db)
}

// Automaticly close pending participants after 60 days.
func closeOldPendingParticipants(db *gorm.DB) {
	glog.Info("Running CloseOldPendingParticipants")
	if db == nil {
		glog.Error("database is nil, trying to close old pending participants")
		return
	}

	values := []struct {
		Name    string `gorm:"name"`
		Email   string `gorm:"email"`
		ChainID uint   `gorm:"chain_id"`
	}{}
	err := db.Raw(`
SELECT u.name, u.email, uc.chain_id
FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
WHERE uc.is_approved = FALSE
	AND uc.created_at < (NOW() - INTERVAL 60 DAY)
	`).Scan(&values).Error
	if err != nil {
		glog.Errorf("Failed to find old pending participants: %v", err)
		return
	}

	// TODO: Send email to all loop hosts.
}
