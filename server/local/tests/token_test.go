package tests

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/stretchr/testify/assert"
)

func TestLoginToken(t *testing.T) {
	// mocks
	_, user, _ := mockTables.MockChainAndUser()

	// create unverified token
	token, ok := auth.TokenCreateUnverified(db, user.ID)
	assert.True(t, ok, "CreateUnverifiedToken should return a true ok")

	// ensure that token is in database
	userToken := models.UserToken{}
	res := db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = ?
LIMIT 1
	`, user.ID, token, false).Scan(&userToken)

	assert.Nil(t, res.Error, "Database call responded with an error")
	assert.Equalf(t, user.ID, userToken.UserID, "New token (%s) not found in search", userToken)

	// ensure unverified token is not usable for authenticate
	_, ok = auth.TokenAuthenticate(db, token)
	assert.Falsef(t, ok, "Unverified token (%s) should not be useable", token)

	// verify token
	ok = auth.TokenVerify(db, token)
	assert.Truef(t, ok, "Token should pass verification (%s)", token)

	// ensure verified token is usable for authenticate
	_, ok = auth.TokenAuthenticate(db, token)
	assert.Truef(t, ok, "Verified token should be useable (%s)", token)

	// ensure token is verified in database
	userTokens := []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = ?
	`, user.ID, token, true).Scan(&userTokens)
	assert.Equal(t, 1, len(userTokens), "token record should exist")

	// remove token
	auth.TokenDelete(db, token)

	// check that user token is removed
	userTokens = []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE token = ?
	`, token).Scan(&userTokens)
	assert.Equal(t, 0, len(userTokens), "user token exists (%v)", userTokens)
}
