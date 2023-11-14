//go:build !ci

package integration_tests

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestChainDeleteWithTwoHosts(t *testing.T) {
	// create host 1 mock
	chain, host1, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
	})

	// create host 2 mock
	host2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsChainAdmin: true,
	})

	// create gin.Context mock
	url := "/v2/chain?chain_uid=" + chain.UID
	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, nil, token)

	// run sut
	controllers.ChainDelete(c)

	// retrieve result
	result := resultFunc()

	// test
	assert.Equal(t, http.StatusFailedDependency, result.Response.StatusCode)

	count := -1
	db.Raw(`SELECT COUNT(id) FROM user_chains WHERE chain_id = ? AND user_id IN ?`, chain.ID, []uint{host1.ID, host2.ID}).Scan(&count)
	assert.Equal(t, 2, count)

	count = -1
	db.Raw(`SELECT COUNT(id) FROM chains WHERE id = ?`, chain.ID).Scan(&count)
	assert.Equal(t, 1, count)
}

func TestChainDelete(t *testing.T) {
	// create host mock
	chain, host, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
	})

	// create host 2 mock
	_, participant, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin: false,
	})

	// create gin.Context mock
	url := "/v2/chain?chain_uid=" + chain.UID
	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, nil, token)

	// run sut
	controllers.ChainDelete(c)

	// retrieve result
	result := resultFunc()

	// test
	assert.Equal(t, http.StatusOK, result.Response.StatusCode)

	count := -1
	db.Raw(`SELECT COUNT(id) FROM user_chains WHERE chain_id = ? AND user_id IN ?`, chain.ID, []uint{host.ID, participant.ID}).Scan(&count)
	assert.Equal(t, 0, count)

	count = -1
	db.Raw(`SELECT COUNT(id) FROM chains WHERE id = ?`, chain.ID).Scan(&count)
	assert.Equal(t, 0, count)
}
