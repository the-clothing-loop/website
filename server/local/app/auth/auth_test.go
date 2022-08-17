package auth_test

import (
	"net/http"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
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
		// {
		// 	MockOptions: MockChainAndUserOptions{
		// 		IsChainAdmin: false,
		// 		IsRootAdmin:  false,
		// 	},
		// 	ExpectedResults: [5]bool{true, true, true, false, false},
		// },
		{
			MockOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
				IsRootAdmin:  false,
			},
			ExpectedResults: [5]bool{true, true, true, true, false},
		},
		// {
		// 	MockOptions: MockChainAndUserOptions{
		// 		IsChainAdmin: false,
		// 		IsRootAdmin:  true,
		// 	},
		// 	ExpectedResults: [5]bool{true, true, true, true, true},
		// },
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
