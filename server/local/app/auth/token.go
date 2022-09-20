package auth

import (
	"strings"
	"time"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

func TokenReadFromRequest(c *gin.Context) (string, bool) {
	token, ok := cookieRead(c)
	if !ok {
		prefix := "Bearer "
		// fallback to bearer token for testing
		a := c.Request.Header.Get("Authorization")
		_, t, ok := strings.Cut(a, prefix)
		if !ok {
			return "", false
		}
		token = t
	}

	return token, true
}

func TokenCreateUnverified(db *gorm.DB, userID uint) (string, bool) {
	// create token
	token := uuid.NewV4().String()

	// set token in database
	res := db.Create(&models.UserToken{
		Token:    token,
		Verified: false,
		UserID:   userID,
	})
	if res.Error != nil {
		return "", false
	}

	return token, true
}

func TokenVerify(db *gorm.DB, token string) bool {
	timeElapsed := time.Now().Add(-24 * time.Hour)

	if res := db.Exec(`
UPDATE user_tokens
SET user_tokens.verified = ?
WHERE user_tokens.token = ?
	AND user_tokens.verified = ?
	AND user_tokens.created_at > ?
	`, true, token, false, timeElapsed.Unix()); res.Error != nil || res.RowsAffected == 0 {
		return false
	}

	if res := db.Exec(`
UPDATE users
SET is_email_verified = ?  
WHERE id = (
	SELECT users.id
	FROM user_tokens
	LEFT JOIN users ON user_tokens.user_id = users.id
	WHERE user_tokens.token = ?
	LIMIT 1
)
	`, true, token); res.Error != nil {
		return false
	}

	return true
}

func TokenAuthenticate(db *gorm.DB, token string) (user *models.User, ok bool) {
	user = &models.User{}
	res := db.Raw(`
SELECT users.*
FROM user_tokens
LEFT JOIN users ON user_tokens.user_id = users.id
WHERE user_tokens.token = ? AND user_tokens.verified = ?
LIMIT 1
	`, token, true).Scan(user)
	if res.Error != nil || user.ID == 0 {
		return nil, false
	}

	return user, true
}

func TokenDelete(db *gorm.DB, token string) {
	db.Exec(`
DELETE FROM user_tokens
WHERE token = ?
	`, token)
}
