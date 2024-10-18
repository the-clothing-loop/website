//go:build !ci

package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestUserDeleteUserChainDependenciesAllChains(t *testing.T) {
	t.Run("two hosts", func(t *testing.T) {
		chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 1,
			IsChainAdmin:    true,
		})
		user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 2,
			IsChainAdmin:    true,
		})
		user1.AddUserChainsToObject(db)
		user2.AddUserChainsToObject(db)

		user1UserChainID := user1.Chains[0].ID

		// Add bag to user1
		bag := mocks.MockBag(t, db, chain.ID, user1.ID, mocks.MockBagOptions{})

		err := user1.DeleteOrPassOnUserChainBags(db, chain.ID)
		assert.Nil(t, err, "DeleteUserChainDependenciesAllChains must not fail")

		newBag := &models.Bag{}
		err = db.Raw("SELECT * FROM bags WHERE id = ? LIMIT 1", bag.ID).Scan(newBag).Error
		assert.Nil(t, err)

		assert.NotEmpty(t, newBag.ID, "Bag should still exist")
		assert.NotEqual(t, user1UserChainID, newBag.UserChainID, "Bag should not still be associated with user1")
		assert.Equal(t, user2.Chains[0].ID, newBag.UserChainID, "Bag should be transferred to user2")
	})
	t.Run("one host", func(t *testing.T) {
		chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 1,
			IsChainAdmin:    true,
		})
		mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 2,
			IsChainAdmin:    false,
		})
		mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 2,
			IsChainAdmin:    true,
			IsNotApproved:   true,
		})
		user1.AddUserChainsToObject(db)

		// Add bag to user1
		bag := mocks.MockBag(t, db, chain.ID, user1.ID, mocks.MockBagOptions{})

		err := user1.DeleteOrPassOnUserChainBags(db, chain.ID)
		assert.Nil(t, err, "DeleteUserChainDependenciesAllChains must not fail")

		newBag := &models.Bag{}
		db.Raw("SELECT * FROM bags WHERE id = ? LIMIT 1", bag.ID).Scan(newBag)
		assert.Empty(t, newBag.ID, "Bag should be deleted")
	})
}
