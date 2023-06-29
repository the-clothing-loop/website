package controllers

import (
	"github.com/OneSignal/onesignal-go-api"
	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

func CronMonthly(db *gorm.DB) {
	emailHostsOldPendingParticipants(db)
}

func CronHourly(db *gorm.DB) {
	notifyIfIsHoldingABagForTooLong(db)
}

// Automaticly close pending participants after 60 days.
func emailHostsOldPendingParticipants(db *gorm.DB) {
	glog.Info("Running emailHostsOldPendingParticipants")
	if db == nil {
		glog.Error("database is nil, trying to close old pending participants")
		return
	}

	// Get all pending participants
	pendingValues := []*views.EmailApproveReminderItem{}
	err := db.Raw(`
SELECT u.name, u.email, uc.chain_id, uc.id AS user_chain_id, c.name AS chain_name
FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
JOIN chains AS c ON c.id = uc.chain_id
WHERE uc.is_approved = FALSE
	AND uc.created_at < (NOW() - INTERVAL 60 DAY)
	AND uc.last_notified_is_unapproved_at IS NULL
	`).Scan(&pendingValues).Error
	if err != nil {
		glog.Errorf("Failed to find old pending participants: %v", err)
		return
	}
	if len(pendingValues) > 0 {
		glog.Infof("Pending participants: %v", pendingValues)
	}

	// List all chain ids of pending participants
	chainIDs := []uint{}
	{
		userChainIDs := []uint{}
		for _, v := range pendingValues {
			chainIDs = append(chainIDs, v.ChainID)
			userChainIDs = append(userChainIDs, v.UserChainID)
		}
		// set all pending as notified to prevent sending the same notification twice
		db.Exec(`UPDATE user_chains SET last_notified_is_unapproved_at = NOW() WHERE id IN ?`, userChainIDs)
	}

	// Get all hosts to send an email to
	type HostByChainValue struct {
		Name    string `gorm:"u.name"`
		Email   string `gorm:"u.email"`
		ChainID uint   `gorm:"c.id"`
	}
	hostsByChain := []*HostByChainValue{}
	db.Raw(`
SELECT u.name, u.email, uc.chain_id
FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id
WHERE uc.chain_id IN ? AND uc.is_chain_admin IS TRUE
ORDER BY u.email
	`, chainIDs).Scan(&hostsByChain)

	// Merge above lists into a structure to send an email to
	type EmailValue struct {
		Name      string
		Email     string
		Approvals []*views.EmailApproveReminderItem
	}
	emailValues := []*EmailValue{}
	for _, h := range hostsByChain {
		if h.Email == "" {
			continue
		}
		isNewEmailValue := true
		indexEmailValues := len(emailValues) - 1
		emailValue := &EmailValue{}
		if indexEmailValues > -1 {
			emailValue = emailValues[indexEmailValues]
			if emailValue.Email != h.Email {
				emailValue = &EmailValue{}
			} else {
				isNewEmailValue = false
			}
		}
		if isNewEmailValue {
			emailValue.Name = h.Name
			emailValue.Email = h.Email
			emailValue.Approvals = []*views.EmailApproveReminderItem{}
		}

		for i := range pendingValues {
			pending := pendingValues[i]
			if pending.ChainID == h.ChainID {
				// fmt.Printf("pending values: %++v\n", pending)
				emailValue.Approvals = append(emailValue.Approvals, pending)
			}
		}

		if isNewEmailValue {
			emailValues = append(emailValues, emailValue)
		}
	}

	for i := range emailValues {
		email := emailValues[i]
		glog.Infof("Sending email approve reminder to %s", email.Email)
		go views.EmailApproveReminder(db, email.Name, email.Email, email.Approvals)
	}
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
