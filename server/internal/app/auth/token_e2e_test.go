//go:build !ci

package auth_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

func TestLoginFlowToken(t *testing.T) {
	// mocks
	_, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsNotEmailVerified: true,
		IsNotTokenVerified: true,
	})
	assert.NotNil(t, user, "mocks.MockChainAndUser should not return nil")

	// create unverified token
	token, err := auth.OtpCreate(db, user.ID)
	assert.Nil(t, err, "CreateUnverifiedToken should return a nil err")

	// ensure that token is in database
	userToken := sharedtypes.UserToken{}
	res := db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = FALSE
LIMIT 1
	`, user.ID, token).Scan(&userToken)

	assert.Nil(t, res.Error, "Database call responded with an error")
	assert.Equalf(t, user.ID, userToken.UserID, "New token (%s) not found in search", userToken)

	// ensure unverified token is not usable for authenticate
	_, _, err = auth.AuthenticateToken(db, token)
	assert.NotNilf(t, err, "Unverified token (%s) should not be useable", token)

	// verify token
	_, newToken, err := auth.OtpVerify(db, *user.Email, token)
	assert.Nil(t, err, "Token should pass verification (%s) %v", token, err)

	// ensure verified token is usable for authenticate
	_, _, err = auth.AuthenticateToken(db, newToken)
	assert.Nil(t, err, "Verified token should be useable (%s) %v", token, err)

	// check that user token is removed
	userTokens := []sharedtypes.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE token = ?
	`, newToken).Scan(&userTokens)
	assert.Equal(t, 0, len(userTokens), "user token exists (%v)", userTokens)
}
