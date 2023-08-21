//go:build !ci

package models_test

import (
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestMailRetryGood(t *testing.T) {
	tests := []mocks.MockMailOptions{
		{
			CreatedAt:        time.Now().Add(-18 * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_DAY,
		},
		{
			CreatedAt:        time.Now().Add(-18 * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        time.Now().Add(-(24 * 8) * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_WEEK,
		},
		{
			CreatedAt:        time.Now().Add(-(24 * 8) * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        time.Now().Add(-(24 * 63) * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
	}

	for _, o := range tests {
		expected := mocks.MockMail(t, db, o)
		t.Run(fmt.Sprintf("with next attempt %v max %v", o.NextRetryAttempt, o.MaxRetryAttempts), func(t *testing.T) {

			t.Run("should exist in the database", func(t *testing.T) {
				list, err := models.MailGetDueForResend(db)
				assert.NoError(t, err)
				assert.NotEmpty(t, list)
				var found *models.Mail
				for i := range list {
					m := list[i]
					if m.ID == expected.ID {
						found = m
						continue
					}
				}
				assert.NotNil(t, found)
				assert.Equal(t, expected.NextRetryAttempt, found.NextRetryAttempt)
			})

			t.Run("database state after UpdateDBFailedResend", func(t *testing.T) {

				expectedID := expected.ID
				newErrString := fmt.Sprintf("FakeError: New %s failed", faker.Pet().Dog())
				expected.UpdateDBFailedResend(db, errors.New(newErrString))

				found := models.Mail{ID: expectedID}
				err := db.First(&found).Error
				if o.NextRetryAttempt+1 > o.MaxRetryAttempts {
					assert.Error(t, err)
					return
				}

				assert.Equal(t, o.NextRetryAttempt+1, found.NextRetryAttempt)
			})
		})
	}
}
