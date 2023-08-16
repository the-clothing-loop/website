//go:build !ci

package integration_tests

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

type testData struct {
	testName      string
	email         string
	user          *models.User
	expectedError error
}

func TestUsersService(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})
	expectedUserExist, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{IsChainAdmin: true})
	tests := []testData{
		{
			testName:      "User exist",
			email:         expectedUserExist.Email.String,
			user:          expectedUserExist,
			expectedError: nil,
		},
		{
			testName:      "User not exist",
			email:         "nonexistent@example.com",
			user:          &models.User{UID: "nonExistentUID"},
			expectedError: errors.New("record not found"),
		},
	}

	t.Run("TestGetByUID", func(t *testing.T) {
		testsUID := append(tests, testData{
			testName:      "It has error because uid is empty",
			email:         "",
			user:          &models.User{UID: ""},
			expectedError: errors.New("record not found"),
		})

		for _, test := range testsUID {
			t.Run(test.testName, func(t *testing.T) {
				actualUser, err := models.UserGetByUID(db, test.user.UID, true)
				assert.Equal(t, test.expectedError, err)

				if test.expectedError == nil {
					assert.Equal(t, test.user.ID, actualUser.ID)
				} else {
					assert.Nil(t, actualUser)
				}

			})
		}
	})

	t.Run("TestGetByEmail", func(t *testing.T) {
		testsEmail := append(tests, testData{
			testName:      "It has error because email is empty",
			email:         "",
			user:          &models.User{UID: ""},
			expectedError: errors.New("Email is required"),
		})

		for _, test := range testsEmail {
			t.Run(test.testName, func(t *testing.T) {
				actualUser, err := models.UserGetByEmail(db, test.email)
				assert.Equal(t, test.expectedError, err)

				if test.expectedError == nil {
					assert.Equal(t, test.user.ID, actualUser.ID)
				} else {
					assert.Nil(t, actualUser)
				}
			})
		}
	})

	t.Run("TestGetAdminsByChain", func(t *testing.T) {
		users, err := models.UserGetAdminsByChain(db, chain.ID)
		assert.Equal(t, 1, len(users))
		assert.Nil(t, err)
	})
}
