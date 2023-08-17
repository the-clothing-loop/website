//go:build !ci

package auth_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
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

func TestAuthenticateEvent(t *testing.T) {
	type Sut struct {
		MockAuthOptions mocks.MockChainAndUserOptions
		IsSameUser      bool
		IsSameChain     bool
		HasEventChain   bool
		ExpectedResult  bool
	}

	suts := []Sut{
		/* 0 */ {
			IsSameUser:     true,
			HasEventChain:  false,
			ExpectedResult: true,
		}, /* 1 */ {
			IsSameUser:     false,
			HasEventChain:  false,
			ExpectedResult: false,
		}, /* 2 */ {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsRootAdmin: true,
			},
			IsSameUser:     false,
			HasEventChain:  false,
			ExpectedResult: true,
		}, /* 3 */ {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsRootAdmin: true,
			},
			IsSameChain:    false,
			HasEventChain:  true,
			ExpectedResult: true,
		}, /* 4 */ {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			},
			IsSameChain:    true,
			HasEventChain:  true,
			ExpectedResult: true,
		}, /* 5 */ {
			IsSameChain:    true,
			HasEventChain:  true,
			ExpectedResult: false,
		}, /* 6 */ {
			IsSameChain:    true,
			IsSameUser:     true,
			HasEventChain:  true,
			ExpectedResult: true,
		}, /* 7 */ {
			IsSameChain:    true,
			HasEventChain:  true,
			ExpectedResult: false,
		}, /* 8 */ {
			HasEventChain:  true,
			ExpectedResult: false,
		}, /* 9 */ {
			MockAuthOptions: mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			},
			IsSameChain:    false,
			HasEventChain:  true,
			ExpectedResult: false,
		},
	}

	for i, sut := range suts {
		authChain, authUser, token := mocks.MockChainAndUser(t, db, sut.MockAuthOptions)
		eventUser := authUser
		eventChain := authChain
		if !sut.IsSameUser {
			if sut.IsSameChain {
				eventUser, _ = mocks.MockUser(t, db, authChain.ID, mocks.MockChainAndUserOptions{})
			} else {
				eventChain, eventUser, _ = mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})
			}
		}

		eventChainID := uint(0)
		if sut.HasEventChain {
			eventChainID = eventChain.ID
		}
		event := mocks.MockEvent(t, db, eventUser.ID, eventChainID)

		c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, token)
		ok, resultAuthUser, resultEvent := auth.AuthenticateEvent(c, db, event.UID)

		assert.Equalf(t, sut.ExpectedResult, ok, "sut index: %v\nsut: %++v\nevent: %++v", i, sut, []any{*event, eventChainID, *eventUser})

		if sut.ExpectedResult {
			assert.NotNilf(t, resultAuthUser, "sut index: %v", i)
			assert.Equalf(t, authUser.ID, resultAuthUser.ID, "sut index: %v", i)
			if sut.IsSameUser {
				assert.Equalf(t, eventUser.ID, resultAuthUser.ID, "sut index: %v", i)
			}
			assert.Equalf(t, event.ID, resultEvent.ID, "sut index: %v", i)
			if sut.IsSameChain {
				assert.Equalf(t, event.ID, resultEvent.ID, "sut index: %v", i)
			} else {
				assert.NotEqualf(t, resultEvent.ChainID, eventChain.ID, "sut index: %v", i)
			}
		} else {
			assert.Nilf(t, resultAuthUser, "sut index: %v", i)
		}
	}
}
