package mocks_test

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/CollActionteam/clothing-loop/server/internal/tests/mocks"
	"github.com/stretchr/testify/assert"
)

func TestMockUserShouldSetChainAdminTrue(t *testing.T) {
	chain, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin: true,
	})

	userChain := &models.UserChain{}
	db.Raw(`SELECT * FROM user_chains WHERE user_id = ? AND chain_id = ? LIMIT 1`, user.ID, chain.ID).Scan(userChain)

	assert.Equal(t, user.ID, userChain.UserID)
	assert.Truef(t, userChain.IsChainAdmin, "user.ID: %d\nchain.ID: %d", user.ID, chain.ID)
}

func TestMockUserShouldSetRootAdminTrue(t *testing.T) {
	_, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsRootAdmin: true,
	})

	assert.Truef(t, user.IsRootAdmin, "user.ID: %d", user.ID)
}
