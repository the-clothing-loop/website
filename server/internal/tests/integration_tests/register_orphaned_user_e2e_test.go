//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
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

	user, _ := mocks.MockOrphanedUser(t, db, mocks.MockChainAndUserOptions{})
	fmt.Println(user)

	url := "/v2/register/orphaned-user"

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

	controllers.RegisterOrphanedUser(c)

	result := resultFunc()

	assert.Equal(t, 200, result.Response.StatusCode)

	testUser := &models.User{}
	db.Raw("SELECT * FROM users WHERE email = ? LIMIT 1", participantEmail).Scan(testUser)
	assert.NotEmpty(t, testUser.ID, "user of participant email: %s not found", participantEmail)

	tx := db.Begin()
	tx.Exec("DELETE FROM user_tokens WHERE user_id = ?", testUser.ID)
	tx.Exec("DELETE FROM users WHERE id = ?", testUser.ID)
	tx.Exec("DELETE FROM newsletters WHERE email = ?", testUser.Email)
	tx.Commit()
}
