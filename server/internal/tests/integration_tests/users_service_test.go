package integration_tests

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/services"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

type testData struct {
	testName      string
	email         string
	user          *models.User
	expectedExist bool
	expectedError error
}

func TestUsersService(t *testing.T) {

	usersService := services.NewUsersService(db)

	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})
	expectedUserExist, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{IsChainAdmin: true})
	tests := []testData{
		{
			testName:      "User exist",
			email:         expectedUserExist.Email.String,
			user:          expectedUserExist,
			expectedExist: true,
			expectedError: nil,
		},
		{
			testName:      "User not exist",
			email:         "nonexistent@example.com",
			user:          &models.User{UID: "nonExistentUID"},
			expectedExist: false,
			expectedError: errors.New("record not found"),
		},
	}

	t.Run("TestGetByUID", func(t *testing.T) {
		testsUID := append(tests, testData{
			testName:      "It has error because uid is empty",
			email:         "",
			user:          &models.User{UID: ""},
			expectedExist: false,
			expectedError: errors.New("userUID is mandatory"),
		})

		for _, test := range testsUID {
			t.Run(test.testName, func(t *testing.T) {
				exist, actualUser, err := usersService.GetByUID(test.user.UID, true)
				assert.Equal(t, test.expectedExist, exist)
				assert.Equal(t, test.expectedError, err)

				if test.expectedExist && test.expectedError == nil {
					assert.Equal(t, test.user.ID, actualUser.ID)
				}

			})
		}
	})

	t.Run("TestGetByEmail", func(t *testing.T) {
		testsEmail := append(tests, testData{
			testName:      "It has error because email is empty",
			email:         "",
			user:          &models.User{UID: ""},
			expectedExist: false,
			expectedError: errors.New("email is mandatory"),
		})

		for _, test := range testsEmail {
			t.Run(test.testName, func(t *testing.T) {
				exist, actualUser, err := usersService.GetByEmail(test.email)
				assert.Equal(t, test.expectedExist, exist)
				assert.Equal(t, test.expectedError, err)

				if test.expectedExist && test.expectedError == nil {
					assert.Equal(t, test.user.ID, actualUser.ID)
				}
			})
		}
	})

	t.Run("TestGetAdminsByChain", func(t *testing.T) {
		users, err := usersService.GetAdminsByChain(chain.ID)
		assert.Equal(t, 1, len(users))
		assert.Nil(t, err)
	})
}
