//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

type MockChainAndUserOptions struct {
	IsNotEmailVerified bool
	IsNotTokenVerified bool
	IsNotApproved      bool
	IsRootAdmin        bool
	IsChainAdmin       bool
	IsNotPublished     bool
	IsOpenToNewMembers bool
	RouteOrderIndex    int
}

func TestRegisterOrphanedUser(t *testing.T) {

	// create user chain mock

	/*chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin: true,
	})*/

	user, token := mocks.MockOrphanedUser(t, db, mocks.MockChainAndUserOptions{})
	fmt.Println(user)

	// create gin.Context mock
	//url := fmt.Sprintf("/v2/user?user_uid=%s", user.UID)
	//	url := "/v2/register/chain-admin"

	url := "/v2/register/orphaned-user"

	//c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)
	participantEmail := fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain())

	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, &gin.H{
		"user": gin.H{
			"name":         "Test " + faker.Person().Name(),
			"email":        participantEmail,
			"phone_number": faker.Person().Contact().Phone,
			"address":      faker.Address().Address(),
			"sizes":        mocks.MockSizes(false),
			"newsletter":   false,
		},
	}, "")

	// From user get
	// run sut
	controllers.RegisterOrphanedUser(c)

	// retrieve result
	result := resultFunc()
	//	bodyJSON := result.BodyJSON()

	// test
	tokenReq, _ := auth.TokenReadFromRequest(c)
	fmt.Println("Test token and tokenReq")
	assert.Equal(t, token, tokenReq)

	//assert.Equalf(t, 200, result.Response.StatusCode, "body: %s auth header: %v", bodyJSON, c.Request.Header.Get("Authorization"))
	//assert.Equal(t, user.Name, bodyJSON["name"])

	//found := false
	/*
		for _, chainUserAny := range bodyJSON["chains"].([]any) {
			chainUser := chainUserAny.(map[string]any)
			if chainUser["chain_uid"] == chain.UID {
				found = true

				assert.Equal(t, chainUser["chain_uid"], chain.UID)
				assert.Equal(t, chainUser["user_uid"], user.UID)
				assert.Equal(t, chainUser["is_chain_admin"], true)
			}
		}
		assert.Truef(t, found, "chainUser of chain_uid: %s not found", chain.UID)
	*/
	// From register basic user
	fmt.Println("Test status code")

	assert.Equal(t, 200, result.Response.StatusCode)

	// Checks the user gets added
	testUser := &models.User{}
	db.Raw("SELECT * FROM users WHERE email = ? LIMIT 1", participantEmail).Scan(testUser)
	assert.NotEmpty(t, testUser.ID, "user of participant email: %s not found", participantEmail)

	/*
		testUserChains := &models.UserChain{}
		db.Raw("SELECT * FROM user_chains WHERE user_id = ? LIMIT 1", testUser.ID).Scan(testUserChains)
		assert.NotEmpty(t, testUserChains.ID, "chainUser of participant user_id: %d not found", testUser.ID)
	*/

	// Test that it isnt added to any user chain???

	tx := db.Begin()
	tx.Exec(`DELETE FROM bags WHERE user_chain_id IN (
			SELECT id FROM user_chains WHERE user_id = ?
		)`, testUser.ID)
	tx.Exec("DELETE FROM user_chains WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM user_tokens WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM users WHERE id = ?", testUser.ID)
	tx.Exec("DELETE FROM newsletters WHERE email = ?", testUser.Email)
	tx.Commit()
}
