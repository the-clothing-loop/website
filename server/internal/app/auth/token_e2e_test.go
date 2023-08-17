//go:build !ci

package auth_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestLoginFlowToken(t *testing.T) {
	// mocks
	_, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsNotEmailVerified: true,
		IsNotTokenVerified: true,
	})

	// create unverified token
	token, err := auth.TokenCreateUnverified(db, user.ID)
	assert.Nil(t, err, "CreateUnverifiedToken should return a nil err")

	// ensure that token is in database
	userToken := models.UserToken{}
	res := db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = FALSE
LIMIT 1
	`, user.ID, token).Scan(&userToken)

	assert.Nil(t, res.Error, "Database call responded with an error")
	assert.Equalf(t, user.ID, userToken.UserID, "New token (%s) not found in search", userToken)

	// ensure unverified token is not usable for authenticate
	_, ok := auth.TokenAuthenticate(db, token)
	assert.Falsef(t, ok, "Unverified token (%s) should not be useable", token)

	// verify token
	ok, _, newToken := auth.TokenVerify(db, token)
	assert.Truef(t, ok, "Token should pass verification (%s)", token)

	// ensure verified token is usable for authenticate
	_, ok = auth.TokenAuthenticate(db, newToken)
	assert.Truef(t, ok, "Verified token should be useable (%s)", token)

	// ensure token is verified in database
	userTokens := []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = TRUE
	`, user.ID, newToken).Scan(&userTokens)
	assert.Equal(t, 1, len(userTokens), "token record should exist")

	// remove token
	auth.TokenDelete(db, newToken)

	// check that user token is removed
	userTokens = []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE token = ?
	`, newToken).Scan(&userTokens)
	assert.Equal(t, 0, len(userTokens), "user token exists (%v)", userTokens)
}
