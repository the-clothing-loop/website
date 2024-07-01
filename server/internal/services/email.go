package services

import (
	"fmt"
	"log/slog"

	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

/*
Given a user and a list of ChainIds, this method performs the following actions:
- searchs all admin from the given chains
- sends them an email with the new user's information.
*/
func EmailLoopAdminsOnUserJoin(db *gorm.DB, user *models.User, chainIDs ...uint) error {
	// find admin users related to the chain to email
	results, err := models.UserGetAdminsByChain(db, chainIDs...)
	if err != nil {
		return err
	}

	if len(results) == 0 {
		slog.Error("Empty chain that is still public", "ChainID", chainIDs)
		return fmt.Errorf("No admins exist for this loop")
	}

	for _, result := range results {
		if !result.Email.Valid {
			continue
		}
		views.EmailSomeoneIsInterestedInJoiningYourLoop(db, result.I18n,
			result.Email.String,
			result.Name,
			result.ChainName,
			user.Name,
			user.Email.String,
			user.PhoneNumber,
			user.Address,
			user.Sizes,
		)
	}

	return nil
}

// excludedEmail can be an empty string
func EmailLoopAdminsOnUserLeft(db *gorm.DB, removedUserName, removedUserEmail, excludedEmail string, chainIDs ...uint) error {
	// find admin users related to the chain to email
	admins, err := models.UserGetAdminsByChain(db, chainIDs...)
	if err != nil {
		return err
	}

	if len(admins) == 0 {
		slog.Error("Empty chain that is still public", "ChainID", chainIDs)
		return fmt.Errorf("No admins exist for this loop")
	}

	for _, admin := range admins {
		email := admin.Email
		if !email.Valid || excludedEmail == email.String || removedUserEmail == email.String {
			continue
		}
		views.EmailSomeoneLeftLoop(db, admin.I18n,
			admin.Name,
			admin.Email.String,
			admin.ChainName,
			removedUserName,
		)
	}

	return nil
}

func EmailYouSignedUpForLoop(db *gorm.DB, user *models.User, chainNames ...string) error {
	for _, chainName := range chainNames {
		if !user.Email.Valid {
			continue
		}
		views.EmailYouSignedUpForLoop(db, user.I18n, user.Name, user.Email.String, chainName)
	}
	return nil
}

// is run by services.ChainDelete
func emailLoopHasBeenDeleted(db *gorm.DB, users []models.UserContactData, chainName string) {
	for _, user := range users {
		if !user.Email.Valid {
			continue
		}
		views.EmailLoopIsDeleted(db, user.I18n, user.Name, user.Email.String, chainName, user.IsApproved)
	}
}
