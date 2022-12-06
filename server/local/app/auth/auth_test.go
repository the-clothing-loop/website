package auth_test

import (
	"net/http"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/CollActionteam/clothing-loop/server/local/tests/mocks"
	"github.com/stretchr/testify/assert"
)

func TestAuthenticate(t *testing.T) {
	type Sut struct {
		MockOptions mocks.MockChainAndUserOptions
		// for each minimumAuthState 0 to 4
		ExpectedResults [5]bool
	}

	suts := []Sut{
		{
			MockOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: false,
				IsRootAdmin:  false,
			},
			ExpectedResults: [5]bool{true, true, true, false, false},
		},
		{
			MockOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
				IsRootAdmin:  false,
			},
			ExpectedResults: [5]bool{true, true, true, true, false},
		},
		{
			MockOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: false,
				IsRootAdmin:  true,
			},
			ExpectedResults: [5]bool{true, true, true, true, true},
		},
	}

	for _, sut := range suts {
		chain, user, token := mocks.MockChainAndUser(t, db, sut.MockOptions)

		for i := 0; i < 5; i++ {
			c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, token)

			// to stop the i am a teapot error
			// AuthState1AnyUser should never need specific chain data
			chainUID := ""
			if i > auth.AuthState1AnyUser {
				chainUID = chain.UID
			}
			ok, resultUser, resultChain := auth.Authenticate(c, db, i, chainUID)

			expectedOk := sut.ExpectedResults[i]
			assert.Equalf(t, expectedOk, ok, "minimumAuthState: %d\nchain.ID: %d user.ID: %d\noptions: %+v", i, chain.ID, user.ID, sut.MockOptions)

			if expectedOk && i >= auth.AuthState1AnyUser {
				assert.NotNil(t, resultUser)
				assert.Equal(t, user.ID, resultUser.ID)
			} else {
				assert.Nil(t, resultUser)
			}

			if expectedOk && i >= auth.AuthState2UserOfChain {
				assert.NotNil(t, resultChain)
				assert.Equal(t, chain.ID, resultChain.ID)
			} else {
				assert.Nil(t, resultChain)
			}
		}
	}
}

func TestAuthenticateUserOfChain(t *testing.T) {
	type Sut struct {
		MockAuthOptions mocks.MockChainAndUserOptions
		MockUserOptions mocks.MockChainAndUserOptions
		IsSameUser      bool
		IsSameChain     bool
		ExpectedResult  bool
	}

	suts := []Sut{
		{
			IsSameUser:     true,
			IsSameChain:    true,
			ExpectedResult: true,
		}, {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsRootAdmin: true,
			},
			IsSameChain:    false,
			ExpectedResult: true,
		}, {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsRootAdmin: true,
			},
			IsSameChain:    true,
			ExpectedResult: true,
		}, {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			},
			IsSameChain:    false,
			ExpectedResult: false,
		}, {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			},
			IsSameChain:    true,
			ExpectedResult: true,
		}, {
			IsSameChain:    true,
			ExpectedResult: false,
		}, {
			ExpectedResult: false,
		},
	}

	for _, sut := range suts {
		authChain, authUser, token := mocks.MockChainAndUser(t, db, sut.MockAuthOptions)

		var chain *models.Chain
		var user *models.User
		if sut.IsSameUser {
			chain = authChain
			user = authUser
		} else {
			if sut.IsSameChain {
				chain = authChain
				user, _ = mocks.MockUser(t, db, authChain.ID, sut.MockUserOptions)
			} else {
				chain, user, _ = mocks.MockChainAndUser(t, db, sut.MockUserOptions)
			}
		}

		c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, token)
		ok, resultUser, resultAuthUser, resultChain := auth.AuthenticateUserOfChain(c, db, chain.UID, user.UID)

		assert.Equalf(t, sut.ExpectedResult, ok, "sut: %+v", sut)

		if sut.ExpectedResult {
			assert.NotNil(t, resultUser)
			assert.Equal(t, user.ID, resultUser.ID)
			if sut.IsSameUser {
				assert.Equal(t, resultAuthUser.ID, resultUser.ID)
			}
			assert.Equal(t, chain.ID, resultChain.ID)
			if sut.IsSameChain {
				assert.Equal(t, authChain.ID, resultChain.ID)
			} else {
				assert.NotEqual(t, authChain.ID, resultChain.ID)
			}
		} else {
			assert.Nil(t, resultUser)
		}
	}
}
