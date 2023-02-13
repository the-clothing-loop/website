package models_test

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/tests/mocks"
	"github.com/stretchr/testify/assert"
)

func TestChainRouteOrder(t *testing.T) {
	chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsEmailUnverified: true,
		IsTokenUnverified: true,
		RouteOrderIndex:   1,
	})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsEmailUnverified: true,
		IsTokenUnverified: true,
		RouteOrderIndex:   2,
	})

	expected := []string{user1.UID, user2.UID}
	actual, err := chain.GetRouteOrderByUserUID(db)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// reverse and set
	expected = []string{user2.UID, user1.UID}
	err = chain.SetRouteOrderByUserUIDs(db, expected)
	assert.NoError(t, err)

	actual, err = chain.GetRouteOrderByUserUID(db)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}
