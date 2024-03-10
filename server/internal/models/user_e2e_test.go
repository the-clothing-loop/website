//go:build !ci

package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestUserNotificationChainUIDs(t *testing.T) {
	t.Run("Is not approved", func(t *testing.T) {
		chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 1,
			IsChainAdmin:    true,
		})
		mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 2,
			IsNotApproved:   true,
		})

		err := user1.AddUserChainsToObject(db)
		assert.NoError(t, err)

		err = user1.AddNotificationChainUIDs(db)
		assert.NoError(t, err)

		notif := user1.NotificationChainUIDs
		assert.NotNil(t, notif)

		assert.Contains(t, notif, chain.UID)
	})

	t.Run("Is approved", func(t *testing.T) {
		chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 1,
			IsChainAdmin:    true,
		})
		mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
			RouteOrderIndex: 2,
		})

		err := user1.AddUserChainsToObject(db)
		assert.NoError(t, err)

		err = user1.AddNotificationChainUIDs(db)
		assert.NoError(t, err)

		notif := user1.NotificationChainUIDs
		assert.NotNil(t, notif)

		assert.NotContains(t, notif, chain.UID)
	})
}
