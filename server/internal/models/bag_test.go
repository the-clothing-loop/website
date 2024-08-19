package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
)

func TestBagAddUpdatedUser(t *testing.T) {
	f := func(initial, expected string) {
		t.Helper()
		b := &models.Bag{}
		b.LastUserEmailToUpdate = initial
		b.AddLastUserEmailToUpdateFifo("new@example.com")
		assert.Equal(t, b.LastUserEmailToUpdate, expected)
	}

	f("", "new@example.com")
	f("old@example.com", "old@example.com,new@example.com")
	f("old2@example.com,old@example.com", "old2@example.com,old@example.com,new@example.com")
	f("old3@example.com,old2@example.com,old@example.com", "old2@example.com,old@example.com,new@example.com")
	f("old4@example.com,old3@example.com,old2@example.com,old@example.com", "old2@example.com,old@example.com,new@example.com")

	f("old2@example.com,old@example.com,new@example.com", "old2@example.com,old@example.com,new@example.com")
	f("old2@example.com,new@example.com,old@example.com", "new@example.com,old@example.com,new@example.com")
}
