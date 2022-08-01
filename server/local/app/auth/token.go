package auth

import (
	"time"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

func TokenReadFromRequest(c *gin.Context, db *gorm.DB) (string, bool) {
	token, ok := cookieRead(c)
	if !ok {
		// fallback to bearer token for testing
		baUser, baPass, ok := c.Request.BasicAuth()
		if !ok || baUser == "Bearer" {
			return "", false
		}

		token = baPass
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

	res := db.Exec(`
	UPDATE user_tokens
	SET verified = ?
	WHERE token = ? AND verified = ? AND created_at > ?
	`, true, token, false, timeElapsed.Unix())

	return res.Error == nil
}

func TokenAuthenticate(db *gorm.DB, token string) (uint, bool) {
	var userID uint
	res := db.Raw(`
	SELECT user_id
	FROM user_tokens
	WHERE token = ? AND verified = ?
	LIMIT 1
	`, token, true).Scan(&userID)
	if res.Error != nil || userID == 0 {
		return 0, false
	}

	return userID, true
}

func TokenDelete(db *gorm.DB, token string) {
	db.Exec(`
DELETE FROM user_tokens
WHERE token = ?
	`, token)
}
