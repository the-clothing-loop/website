//go:build !ci

package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestChainDeleteSuccessful(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		RouteOrderIndex: 1,
	})
	mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		RouteOrderIndex: 2,
	})

	db = db.Debug()

	err := chain.Delete(db)
	assert.NoError(t, err)

	foundChains := 0
	db.Raw("SELECT COUNT(*) FROM chains WHERE id = ?", chain.ID).Scan(&foundChains)
	assert.Equalf(t, 0, foundChains, "Expected loop to be removed.")
}
