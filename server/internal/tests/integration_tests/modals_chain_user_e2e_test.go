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

		unnaprovedUser, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{IsNotApproved: true})

		relationId, err := models.UserChainCheckIfRelationExist(db, chain.ID, unnaprovedUser.ID, false)
		assert.NotZero(t, relationId)
		assert.Nil(t, err)

		notExistenRelationId, err := models.UserChainCheckIfRelationExist(db, chain.ID, unnaprovedUser.ID, true)
		assert.Zero(t, notExistenRelationId)
		assert.NotNil(t, err)

		notExistenRelationId1, err := models.UserChainCheckIfRelationExist(db, 0, 0, false)
		assert.Zero(t, notExistenRelationId1)
		assert.NotNil(t, err)
	})
}
