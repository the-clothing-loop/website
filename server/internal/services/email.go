package services

import (
	"fmt"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	"gorm.io/gorm"
)

/*
Given a user and a list of ChainIds, this method performs the following actions:
- searchs all admin from the given chains
- sends them an email with the new user's information.
- Also, it sends an email to the user for every loop he intends to join.
*/
func EmailLoopAdminsOnUserJoin(db *gorm.DB, user *models.User, chainIds ...uint) error {

	// find admin users related to the chain to email
	results, err := models.UserGetAdminsByChain(db, chainIds...)
	if err != nil {
		return err
	}

	if len(results) == 0 {
		goscope.Log.Errorf("Empty chain that is still public: ChainID: %d", chainIds)
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
		views.EmailLoopIsDeleted(db, user.I18n, user.Name, user.Email.String, chainName)
	}
}
