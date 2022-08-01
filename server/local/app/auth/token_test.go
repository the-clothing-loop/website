package auth

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/stretchr/testify/assert"
)

const TestUserID = uint(1)
const TestUserEmail = "test@example.com"

func TestLoginToken(t *testing.T) {
	// init
	app.ConfigTestInit("../../..")
	db := app.DatabaseInit()

	// create unverified token
	token, ok := TokenCreateUnverified(db, TestUserID)
	assert.True(t, ok, "CreateUnverifiedToken returned not ok")

	// ensure that token is in database
	userToken := models.UserToken{}
	res := db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = ?
LIMIT 1
	`, TestUserID, token, false).Scan(&userToken)

	assert.Nil(t, res.Error, "Database call responded with an error")
	assert.Equalf(t, TestUserID, userToken.UserID, "New token (%s) not found in search", userToken)

	// ensure unverified token is not usable for authenticate
	_, ok = TokenAuthenticate(db, token)
	assert.Falsef(t, ok, "Unverified token (%s) should not be useable", token)

	// verify token
	ok = TokenVerify(db, token)
	assert.Truef(t, ok, "Token should pass verification (%s)", token)

	// ensure verified token is usable for authenticate
	_, ok = TokenAuthenticate(db, token)
	assert.Truef(t, ok, "Verified token should be useable (%s)", token)

	// ensure token is verified in database
	userTokens := []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE user_id = ? AND token = ? AND verified = ?
	`, TestUserID, token, true).Scan(&userTokens)
	assert.Equal(t, 1, len(userTokens), "token record should exist")

	// remove token
	TokenDelete(db, token)

	// check that user token is removed
	userTokens = []models.UserToken{}
	db.Raw(`
SELECT *
FROM user_tokens
WHERE token = ?
	`, token).Scan(&userTokens)
	assert.Equal(t, 0, len(userTokens), "user token exists (%v)", userTokens)
}
