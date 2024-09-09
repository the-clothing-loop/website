//go:build !ci

package models_test

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
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

func TestUserOmitData(t *testing.T) {
	t.Run("Ensure everything is not omitted authUser with a loop size of 1", func(t *testing.T) {
		f := func(t *testing.T, isPausedLoopOnly bool) {
			t.Helper()
			chain1, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				RoutePrivacy:     lo.ToPtr(2),
				RouteOrderIndex:  1,
				IsPausedLoopOnly: isPausedLoopOnly,
			})

			res, err := models.UserOmitData(db, chain1, []models.User{*user1}, user1.ID)
			assert.NoError(t, err)
			assert.Len(t, res, 1)
			for _, user := range res {
				if user.ID == user1.ID {
					assert.Equal(t, user.Address, user1.Address)
					assert.NotEqual(t, "***", user.Address)
				} else {
					assert.Fail(t, "result should contain user 1")
				}
			}
		}
		f(t, true)
		f(t, false)
	})
	t.Run("Ensure everything is not omitted of authUser with a loop size of 2", func(t *testing.T) {
		chain1, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			RoutePrivacy:     lo.ToPtr(2),
			RouteOrderIndex:  1,
			IsPausedLoopOnly: false,
		})
		user2, _ := mocks.MockUser(t, db, chain1.ID, mocks.MockChainAndUserOptions{
			IsPausedLoopOnly: false,
			RouteOrderIndex:  2,
		})

		res, err := models.UserOmitData(db, chain1, []models.User{*user1, *user2}, user1.ID)
		assert.NoError(t, err)
		assert.Len(t, res, 2)
		for _, user := range res {
			switch user.ID {
			case user2.ID:
				assert.Equal(t, user2.Address, user.Address)
				assert.NotEqual(t, "***", user.Address)
			case user1.ID:
				assert.Equal(t, user1.Address, user.Address)
				assert.NotEqual(t, "***", user.Address)
			default:
				assert.Fail(t, "Invalid user found")
			}
		}
	})

	t.Run("Ensure everything is omitted if authUser is paused except for them self", func(t *testing.T) {
		chain1, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			IsOpenToNewMembers: true,
			RoutePrivacy:       lo.ToPtr(2),
			RouteOrderIndex:    1,
			IsPausedLoopOnly:   true,
		})
		user2, _ := mocks.MockUser(t, db, chain1.ID, mocks.MockChainAndUserOptions{
			IsPausedLoopOnly: false,
		})

		res, err := models.UserOmitData(db, chain1, []models.User{*user1, *user2}, user1.ID)
		assert.NoError(t, err)
		for _, user := range res {
			switch user.ID {
			case user2.ID:
				assert.NotEqual(t, user2.Address, user.Address)
				assert.Equal(t, "***", user.Address)
			case user1.ID:
				assert.Equal(t, user1.Address, user.Address)
				assert.NotEqual(t, "***", user.Address)
			}
		}
	})

	t.Run("Ensure nothing is omitted if authUser is paused else where", func(t *testing.T) {
		chain1, user2, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			IsOpenToNewMembers: true,
			RoutePrivacy:       lo.ToPtr(2),
			RouteOrderIndex:    1,
			IsPausedLoopOnly:   false,
		})
		_, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			IsPausedLoopOnly: true,
		})
		mocks.MockAddUserToChain(t, db, chain1.ID, user1, mocks.MockChainAndUserOptions{
			RouteOrderIndex:  2,
			IsPausedLoopOnly: false,
		})

		res, err := models.UserOmitData(db, chain1, []models.User{*user1, *user2}, user1.ID)
		assert.NoError(t, err)
		for _, user := range res {
			switch user.ID {
			case user2.ID:
				assert.Equal(t, user2.Address, user.Address)
				assert.NotEqual(t, "***", user.Address)
			}
		}
	})
}
