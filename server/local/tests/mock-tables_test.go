package tests

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/stretchr/testify/assert"
)

func TestMockUserShouldSetChainAdminTrue(t *testing.T) {
	chain, user, _ := mockTables.MockChainAndUser(MockChainAndUserOptions{
		IsChainAdmin: true,
	})

	userChain := &models.UserChain{}
	db.Raw(`SELECT * FROM user_chains WHERE user_id = ? AND chain_id = ? LIMIT 1`, user.ID, chain.ID).Scan(userChain)

	assert.Equal(t, user.ID, userChain.UserID)
	assert.Truef(t, userChain.IsChainAdmin, "user.ID: %d\nchain.ID: %d", user.ID, chain.ID)
}

func TestMockUserShouldSetRootAdminTrue(t *testing.T) {
	_, user, _ := mockTables.MockChainAndUser(MockChainAndUserOptions{
		IsRootAdmin: true,
	})

	assert.Truef(t, user.IsRootAdmin, "user.ID: %d", user.ID)
}
