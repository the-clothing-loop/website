package services

import (
	"net/http"

	"github.com/getsentry/sentry-go"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/httperror"
	"gorm.io/gorm"
)

func ChainDelete(db *gorm.DB, chain *models.Chain) *httperror.HttpError {
	users, err := chain.GetUserContactData(db)
	if err != nil {
		sentry.CaptureException(err)
		return httperror.New(http.StatusInternalServerError, "Unable to notify loop members, please contact us.")
	}

	err = chain.Delete(db)
	if err != nil {
		sentry.CaptureException(err)
		return httperror.New(http.StatusInternalServerError, "Unable to delete loop, please contact us.")
	}

	emailLoopHasBeenDeleted(db, users, chain.Name)
	return nil
}
