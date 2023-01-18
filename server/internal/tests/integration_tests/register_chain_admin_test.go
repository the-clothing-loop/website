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

func TestRegisterChainAdmin(t *testing.T) {
	// create gin.Context mock
	url := "/v2/register/chain-admin"
	adminEmail := fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain())
	c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, &gin.H{
		"chain": gin.H{
			"name":                "Test " + faker.Company().Name(),
			"address":             faker.Address().Address(),
			"description":         faker.Company().CatchPhrase(),
			"latitude":            faker.Address().Latitude(),
			"longitude":           faker.Address().Latitude(),
			"radius":              float32(faker.RandomFloat(3, 2, 30)),
			"open_to_new_members": true,
			"sizes":               mocks.MockSizes(false),
			"genders":             mocks.MockGenders(false),
		},
		"user": gin.H{
			"name":         "Test " + faker.Person().Name(),
			"email":        adminEmail,
			"phone_number": faker.Person().Contact().Phone,
			"address":      faker.Address().Address(),
			"sizes":        mocks.MockSizes(false),
			"newsletter":   true,
		},
	}, "")

	// run sut
	controllers.RegisterChainAdmin(c)

	// retrieve result
	result := resultFunc()

	// test
	// assert.FailNowf(t, "testing", "status: %d, body: ~%s~, token: %s, header: %s", result.Response.StatusCode, result.Body, token, c.Request.Header.Get("Authorization"))
	assert.Equal(t, 200, result.Response.StatusCode)

	testUser := &models.User{}
	db.Raw("SELECT * FROM users WHERE email = ? LIMIT 1", adminEmail).Scan(testUser)
	assert.NotEmpty(t, testUser.ID, "user of admin email: %s not found", adminEmail)
	assert.Equal(t, adminEmail, testUser.Email.String)

	testUserChain := &models.UserChain{}
	db.Raw("SELECT * FROM user_chains WHERE user_id = ? LIMIT 1", testUser.ID).Scan(testUserChain)
	assert.NotEmpty(t, testUserChain.ID, "chainUser of admin user_id: %d not found", testUser.ID)

	testChain := &models.Chain{}
	db.Raw("SELECT * FROM chains WHERE id = ? LIMIT 1", testUserChain.ChainID).Scan(testChain)
	assert.NotEmpty(t, testChain.ID, "chain of admin chains.id: %d not found", testUserChain.ChainID)

	// cleanup
	tx := db.Begin()
	tx.Exec("DELETE FROM user_chains WHERE user_id = ? OR chain_id = ?", testUser.ID, testChain.ID)
	tx.Exec("DELETE FROM user_tokens WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM users WHERE id = ?", testUser.ID)
	tx.Exec("DELETE FROM chains WHERE id = ?", testChain.ID)
	tx.Exec("DELETE FROM newsletters WHERE email = ?", adminEmail)
	tx.Commit()
}
