package controllers

import (
	"github.com/OneSignal/onesignal-go-api"
	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

func CronMonthly(db *gorm.DB) {
	closeOldPendingParticipants(db)
}

func CronHourly(db *gorm.DB) {
	notifyIfIsHoldingABagForTooLong(db)
}

// Automaticly close pending participants after 60 days.
func closeOldPendingParticipants(db *gorm.DB) {
	glog.Info("Running closeOldPendingParticipants")
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

func notifyIfIsHoldingABagForTooLong(db *gorm.DB) {
	glog.Info("Running notifyIfIsHoldingABagForTooLong")
	res := &[]struct {
		UserUID   string `gorm:"user_uid"`
		BagNumber string `gorm:"bag_number"`
		BagID     uint   `gorm:"bag_id"`
	}{}
	db.Raw(`
SELECT b.number as bag_number, u.uid as user_uid, b.id as bag_id
FROM bags as b
JOIN user_chains as uc ON b.user_chain_id = uc.id
JOIN users as u ON uc.user_id = u.id
WHERE b.updated_at < ADDDATE(NOW(), INTERVAL -7 DAY)
AND b.last_notified_at IS NULL
	`).Scan(res)

	if len(*res) > 0 {
		bagIDs := []uint{}
		for i := range *res {
			item := (*res)[i]
			glog.Infof("Create notification for user %v holding bag %v\n", item.UserUID, item.BagNumber)
			app.OneSignalCreateNotification(db, []string{item.UserUID}, *views.Notifications["bagYouAreHoldingIsTooOldTitle"], onesignal.StringMap{
				En: onesignal.PtrString(item.BagNumber),
			})

			bagIDs = append(bagIDs, item.BagID)
		}

		db.Exec(`UPDATE bags SET last_notified_at = NOW() WHERE id IN ?`, bagIDs)
	}
}
