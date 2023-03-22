package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestChainRouteOrder(t *testing.T) {
	chain, user1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		RouteOrderIndex: 1,
	})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		RouteOrderIndex: 2,
	})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		RouteOrderIndex: 3,
	})

	db = db.Debug()

	expected := []string{user1.UID, user2.UID, user3.UID}
	actual, err := chain.GetRouteOrderByUserUID(db)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// reverse and set
	expected = []string{user3.UID, user2.UID, user1.UID}
	err = chain.SetRouteOrderByUserUIDs(db, expected)
	assert.NoError(t, err)

	actual, err = chain.GetRouteOrderByUserUID(db)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}
