package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/GGP1/atoll"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gorm.io/gorm"
)

var validate = validator.New()

type MyJwtClaims struct {
	jwt.RegisteredClaims
	Pepper int `json:"pepper"`
}

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

func OtpCreate(db *gorm.DB, userID uint) (string, error) {
	// create token
	tokenB, err := atoll.NewPassword(8, []atoll.Level{atoll.Digit})
	if err != nil {
		return "", err
	}
	token := string(tokenB)

	// set token in database
	res := db.Create(&models.UserToken{
		Token:    token,
		Verified: false,
		UserID:   userID,
	})
	if res.Error != nil {
		return "", res.Error
	}

	return token, nil
}

// Returns the user before it was verified
func OtpVerify(db *gorm.DB, userEmail, otp string) (*models.User, string, error) {
	// check if otp is valid
	userToken := &models.UserToken{}
	db.Raw(`
SELECT ut.* FROM user_tokens AS ut
JOIN users AS u ON ut.user_id = u.id
WHERE ut.token = ? AND u.email = ? AND ut.verified = FALSE
LIMIT 1
	`, otp, userEmail).Scan(userToken)
	if userToken.ID == 0 {
		return nil, "", fmt.Errorf("User token not found in database")
	}

	db.Delete(userToken)

	user := &models.User{}
	db.Raw(`SELECT * FROM users WHERE id = ? LIMIT 1`, userToken.UserID).Scan(user)
	if user.ID == 0 {
		return nil, "", fmt.Errorf("User not found in database")
	}

	// setup user as verified
	if !user.IsEmailVerified {
		if db.Exec(`
UPDATE users
SET is_email_verified = TRUE
WHERE id = ?
	`, user.ID).Error != nil {
			return nil, "", fmt.Errorf("Unable to update user to verified email")
		}
	}

	if user.Email.Valid {
		if res := db.Exec(`
UPDATE newsletters
SET verified = TRUE
WHERE email = ?
	`, user.Email.String); res.Error != nil {
			return nil, "", fmt.Errorf("Unable to allow sending newsletters to user")
		}
	}

	// generate new jwt
	tokenString, err := JwtGenerate(user)
	if err != nil {
		return nil, "", err
	}

	return user, tokenString, nil
}

func JwtGenerate(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, MyJwtClaims{
		Pepper: user.JwtTokenPepper,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    user.UID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(2 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	tokenString, err := token.SignedString([]byte(app.Config.JWT_SECRET))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func AuthenticateToken(db *gorm.DB, tokenString string) (*models.User, bool, error) {
	usedOldToken := false
	user, err := authenticateOldToken(db, tokenString)
	if err == nil {
		usedOldToken = true
	} else {
		user, err = authenticateJwt(db, tokenString)
		if err != nil {
			return nil, false, err
		}
	}

	shouldUpdateLastSignedInAt := true
	if user.LastSignedInAt.Valid {
		// if user last signed in earlier than an hour ago, we should update last signed in value
		shouldUpdateLastSignedInAt = user.LastSignedInAt.Time.Before(time.Now().Add(time.Duration(-1 * time.Hour)))
	}
	if shouldUpdateLastSignedInAt {
		db.Exec(`
UPDATE users
SET users.last_signed_in_at = NOW()
WHERE users.id = ?
	`, user.ID)
	}

	return user, usedOldToken, nil
}

func authenticateJwt(db *gorm.DB, tokenString string) (*models.User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &MyJwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(app.Config.JWT_SECRET), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*MyJwtClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}

	user := &models.User{}
	err = db.Raw(`SELECT * FROM users WHERE uid = ? LIMIT 1`, claims.Issuer).Scan(user).Error
	if err != nil || user.ID == 0 {
		fmt.Print(err)
		return nil, fmt.Errorf("Unable to find user in database (%s)", claims.Issuer)
	}

	if user.JwtTokenPepper != claims.Pepper {
		return nil, fmt.Errorf("pepper incorrect: %d vs %d\n", user.JwtTokenPepper, claims.Pepper)
	}

	return user, nil
}
func authenticateOldToken(db *gorm.DB, token string) (*models.User, error) {
	if len(token) != 36 {
		return nil, fmt.Errorf("Not the length of a uuid")
	}
	err := validate.Var(token, "uuid")
	if err != nil {
		return nil, fmt.Errorf("No a uuid by standards of validator/v10")
	}

	user := &models.User{}
	db.Raw(`
SELECT u.* FROM user_tokens AS ut
JOIN users AS u ON ut.user_id = u.id
WHERE ut.token = ? AND ut.verified = TRUE
LIMIT 1
	`, token).Scan(user)
	if user.ID == 0 {
		return nil, fmt.Errorf("User not fount in database")
	}

	db.Exec(`DELETE FROM user_tokens WHERE token = ?`, token)

	return user, nil
}

// func OtpDeleteOld(db *gorm.DB, token string) {
// 	db.Exec(`
// DELETE FROM user_tokens
// WHERE created_at < ADDDATE(NOW(), INTERVAL -2 DAY)
// 	`, token)
// }
