package controllers

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

var validate = validator.New()

func CronMonthly(db *gorm.DB) {
	closeChainsWithOldPendingParticipants(db)
	emailHostsOldPendingParticipants(db)
	removeOldChatMessages(db)
}

func CronDaily(db *gorm.DB) {
	emailSendAgain(db)
	emailAbandonedChainRecruitment(db)
	auth.OtpDeleteOld(db)
}

func CronHourly(db *gorm.DB) {
	notifyIfIsHoldingABagForTooLong(db)
}

// Email hosts about pending participants after 60 days.
func emailHostsOldPendingParticipants(db *gorm.DB) {
	slog.Info("Running emailHostsOldPendingParticipants")
	if db == nil {
		slog.Error("database is nil, trying to close old pending participants")
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
	AND u.is_email_verified = TRUE
	AND uc.created_at < (NOW() - INTERVAL 60 DAY)
	AND uc.last_notified_is_unapproved_at IS NULL
	`).Scan(&pendingValues).Error
	if err != nil {
		slog.Error("Failed to find old pending participants", "err", err)
		return
	}
	if len(pendingValues) > 0 {
		slog.Info("Pending participants", "values", pendingValues)
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
		I18n    string `gorm:"u.i18n"`
	}
	hostsByChain := []*HostByChainValue{}
	db.Raw(`
SELECT u.name, u.email, uc.chain_id, u.i18n
FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id
WHERE uc.chain_id IN ? AND uc.is_chain_admin IS TRUE
ORDER BY u.email
	`, chainIDs).Scan(&hostsByChain)

	// Merge above lists into a structure to send an email to
	type EmailValue struct {
		Name      string
		Email     string
		I18n      string
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
			emailValue.I18n = h.I18n
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
		slog.Info("Sending email approve reminder", "to", email.Email)
		go views.EmailApproveReminder(db, email.I18n, email.Name, email.Email, email.Approvals)
	}
}

// Close chains if pending participants are still pending 30 days after reminder email is sent

func closeChainsWithOldPendingParticipants(db *gorm.DB) {
	slog.Info("Running closeChainsWithOldPendingParticipants")
	db.Exec(`
		UPDATE chains SET published = FALSE, open_to_new_members = FALSE, last_abandoned_at = NOW() WHERE id IN (
			SELECT DISTINCT(uc.chain_id)
			FROM user_chains AS uc
			JOIN chains AS c ON c.id = uc.chain_id
			WHERE uc.is_approved = FALSE
			AND uc.last_notified_is_unapproved_at < (NOW() - INTERVAL 30 DAY)
			AND c.published = TRUE
			AND c.id NOT IN (
				SELECT DISTINCT(uc2.chain_id) FROM user_chains AS uc2
				JOIN users AS u2 ON u2.id = uc2.user_id
				WHERE u2.last_signed_in_at > (NOW() - INTERVAL 90 DAY)
				AND uc2.is_chain_admin = TRUE
			)
		)
		`)
}
func emailAbandonedChainRecruitment(db *gorm.DB) {
	slog.Info("Running emailAbandonedChainRecruitment")
	// Get the abandoned chains older than 7 days
	chainIDs := []uint{}
	err := db.Raw(`
SELECT UNIQUE(c2.id) FROM chains AS c2
JOIN user_chains AS uc ON uc.chain_id = c2.id AND uc.is_chain_admin = FALSE
JOIN users ON uc.user_id = users.id AND users.is_email_verified = TRUE
WHERE c2.last_abandoned_at < (NOW() - INTERVAL 7 DAY)
	AND c2.last_abandoned_recruitment_email IS NULL
GROUP BY c2.id
HAVING COUNT(uc.id) > 0
	`).Scan(&chainIDs).Error
	if err != nil {
		slog.Info("Unable to get abandoned chains", "err", err)
		return
	}
	if len(chainIDs) == 0 {
		return
	}

	// get participants of chains
	users := []models.UserContactData{}
	err = db.Raw(`
SELECT
	users.name AS name,
	users.email AS email,
	users.i18n AS i18n,
	chains.name AS chain_name
FROM user_chains AS uc
JOIN users ON uc.user_id = users.id
JOIN chains ON uc.chain_id = chains.id
WHERE chains.id IN ? AND uc.is_chain_admin = FALSE
	`, chainIDs).Scan(&users).Error
	if err != nil {
		slog.Error("Unable to get participants of abandoned chains", "err", err)
		return
	}

	// send emails
	for _, u := range users {
		if !u.Email.Valid {
			continue
		}
		views.EmailDoYouWantToBeHost(db, u.I18n, u.Name, u.Email.String, u.ChainName)
	}

	// prevent duplicate emails
	err = db.Exec(`UPDATE chains AS c SET c.last_abandoned_recruitment_email = NOW() WHERE c.id IN ?`, chainIDs).Error
	if err != nil {
		slog.Error("Unable to prevent duplicate emails for abandoned chains", "err", err)
		return
	}
}

func notifyIfIsHoldingABagForTooLong(db *gorm.DB) {
	slog.Info("Running notifyIfIsHoldingABagForTooLong")
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
WHERE b.updated_at < (NOW() - INTERVAL 7 DAY)
AND b.last_notified_at IS NULL
	`).Scan(res)

	if len(*res) > 0 {
		bagIDs := []uint{}
		for i := range *res {
			item := (*res)[i]
			slog.Info("Create notification", "user", item.UserUID, "holding_bag", item.BagNumber)
			app.OneSignalCreateNotification(db, []string{item.UserUID}, *views.Notifications[views.NotificationEnumTitleBagTooOld], app.OneSignalEllipsisContent(item.BagNumber))

			bagIDs = append(bagIDs, item.BagID)
		}

		db.Exec(`UPDATE bags SET last_notified_at = NOW() WHERE id IN ?`, bagIDs)
	}
}

func emailSendAgain(db *gorm.DB) {
	slog.Info("Running emailSendAgain")
	ms, err := models.MailGetDueForResend(db)
	if err != nil {
		return
	}

	fmt.Printf("Error mail send: %++v", ms)
	for _, m := range ms {
		err := validate.Var(m.ToAddress, "email")
		if err != nil {
			m.Delete(db)
			continue
		}
		err = app.MailSend(db, m)
		// err = models.ErrMailLastRetry
		errr := m.UpdateNextRetryAttempt(db, err)

		if errr != nil {
			if errors.Is(errr, models.ErrMailLastRetry) {
				views.EmailRootAdminFailedLastRetry(db, m.ToAddress, m.Subject)
			}
		}
	}
}

func removeOldChatMessages(db *gorm.DB) {
	slog.Info("Running removeOldChatMessages")

	oldestAllowedMessageDateMilli := time.Now().Add(-30 * 24 * time.Hour).UnixMilli()

	affected := db.Debug().Exec(`DELETE FROM chat_messages WHERE created_at < ?`, oldestAllowedMessageDateMilli).RowsAffected
	if affected > 0 {
		slog.Warn("old chat messages removed", "affected", affected)
	}
}
