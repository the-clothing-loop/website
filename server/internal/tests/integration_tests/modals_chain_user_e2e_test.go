//go:build !ci

package integration_tests

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestChainUsersService(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})
	mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{IsChainAdmin: true})
	mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{})
	mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{})
	mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{})

	t.Run("UserChainGetIndirectByChain", func(t *testing.T) {
		chainUserData, err := models.UserChainGetIndirectByChain(db, chain.ID)
		assert.Equal(t, 5, len(chainUserData))
		assert.Nil(t, err)
	})

	t.Run("UserChainCheckIfRelationExist", func(t *testing.T) {
		unapprovedUser, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{IsNotApproved: true})

		relationID, found, err := models.UserChainCheckIfRelationExist(db, chain.ID, unapprovedUser.ID, false)
		assert.NotZero(t, relationID)
		assert.True(t, found)
		assert.Nil(t, err)

		notExistRelationID, found, err := models.UserChainCheckIfRelationExist(db, chain.ID, unapprovedUser.ID, true)
		assert.Zero(t, notExistRelationID)
		assert.False(t, found)
		assert.Nil(t, err)

		notExistRelationID1, found, err := models.UserChainCheckIfRelationExist(db, 0, 0, false)
		assert.Zero(t, notExistRelationID1)
		assert.False(t, found)
		assert.Nil(t, err)
	})

}
