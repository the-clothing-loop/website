//go:build !ci

package integration_tests

import (
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestAddUser(t *testing.T) {
	// create user chain mock
	chain, admin, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
	})

	// create user mock
	_, participant, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})

	// create gin.Context mock
	url := "/v2/chain/add-user"
	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, &gin.H{
		"user_uid":       participant.UID,
		"chain_uid":      chain.UID,
		"is_chain_admin": false,
	}, token)

	// run sut
	controllers.ChainAddUser(c)

	// retrieve result
	result := resultFunc()

	// test
	// assert.FailNowf(t, "testing", "status: %d, body: ~%s~, token: %s, header: %s", result.Response.StatusCode, result.Body, token, c.Request.Header.Get("Authorization"))
	tokenReq, _ := auth.TokenReadFromRequest(c)
	assert.Equal(t, token, tokenReq)
	assert.Equalf(t, 200, result.Response.StatusCode, "body: %s auth header: %v", result.Body, c.Request.Header.Get("Authorization"))

	uc := &models.UserChain{}
	db.Raw("SELECT * FROM user_chains WHERE user_id = ? AND chain_id = ? LIMIT 1", admin.ID, chain.ID).Scan(&uc)
	assert.NotEmpty(t, uc, "chainUser of admin chain_id: %d user_id: %d not found", chain.ID, admin.ID)

	uc = &models.UserChain{}
	db.Raw("SELECT * FROM user_chains WHERE user_id = ? AND chain_id = ? LIMIT 1", participant.ID, chain.ID).Scan(&uc)
	assert.NotEmpty(t, uc, "chainUser of participant chain_id: %d user_id: %d not found", chain.ID, participant.ID)
}
