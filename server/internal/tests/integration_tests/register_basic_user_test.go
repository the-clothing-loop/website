package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/controllers"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/CollActionteam/clothing-loop/server/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRegisterBasicUser(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
	})

	// create gin.Context mock
	url := "/v2/register/chain-admin"
	participantEmail := fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain())
	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, &gin.H{
		"chain_uid": chain.UID,
		"user": gin.H{
			"name":         "Test " + faker.Person().Name(),
			"email":        participantEmail,
			"phone_number": faker.Person().Contact().Phone,
			"address":      faker.Address().Address(),
			"sizes":        mocks.MockSizes(false),
			"newsletter":   false,
		},
	}, "")

	// run sut
	controllers.RegisterBasicUser(c)

	// retrieve result
	result := resultFunc()

	// test
	// assert.FailNowf(t, "testing", "status: %d, body: ~%s~, token: %s, header: %s", result.Response.StatusCode, result.Body, token, c.Request.Header.Get("Authorization"))
	assert.Equal(t, 200, result.Response.StatusCode)

	testUser := &models.User{}
	db.Raw("SELECT * FROM users WHERE email = ? LIMIT 1", participantEmail).Scan(testUser)
	assert.NotEmpty(t, testUser.ID, "user of participant email: %s not found", participantEmail)

	testUserChains := &models.UserChain{}
	db.Raw("SELECT * FROM user_chains WHERE user_id = ? LIMIT 1", testUser.ID).Scan(testUserChains)
	assert.NotEmpty(t, testUserChains.ID, "chainUser of participant user_id: %d not found", testUser.ID)

	tx := db.Begin()
	tx.Exec("DELETE FROM user_chains WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM user_tokens WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM users WHERE id = ?", testUser.ID)
	tx.Exec("DELETE FROM newsletters WHERE email = ?", testUser.Email)
	tx.Commit()
}
