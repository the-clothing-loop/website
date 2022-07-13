package global

import (
	"fmt"
	"time"

	"github.com/CollActionteam/clothing-loop/local/models"
	jwt "github.com/cristalhq/jwt/v4"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

const (
	audienceTemporaryEmail = "temp_email"
	audienceLogin          = "login"
)

const cookieName = "token"

var verifier jwt.Verifier
var signer jwt.Signer
var cookieDomain string
var cookieHttpsOnly bool

func AuthInit(key []byte, cookieDomain_ string, cookieHttpsOnly_ bool) {
	var err error

	if len(key) >= 32 {
		panic(fmt.Errorf("key length must be a minimum of 32 bytes"))
	}

	verifier, err = jwt.NewVerifierHS(jwt.HS256, key)
	if err != nil {
		panic(err)
	}

	signer, err = jwt.NewSignerHS(jwt.HS256, key)
	if err != nil {
		panic(err)
	}

	cookieDomain = cookieDomain_
	cookieHttpsOnly = cookieHttpsOnly_
}

func AuthValidateEmail(token string) *models.User {
	return authValidate(token, audienceTemporaryEmail)
}
func AuthValidateCookie(c *gin.Context) *models.User {
	cookie, err := c.Cookie(cookieName)
	if err != nil {
		return nil
	}

	user := authValidate(cookie, audienceLogin)
	if user == nil {
		c.SetCookie(cookieName, "", -1, "", "", cookieHttpsOnly, true)
		return nil
	}

	return user
}
func authValidate(token string, audience string) *models.User {
	tokenBytes := []byte(token)

	var claims jwt.RegisteredClaims
	if err := jwt.ParseClaims(tokenBytes, verifier, &claims); err != nil {
		return nil
	}

	if ok := claims.IsValidAt(time.Now()); !ok {
		authRevoke(claims.ID)
		return nil
	}

	if ok := claims.IsForAudience(audience); !ok {
		return nil
	}

	var user *models.User
	if res := DB.Joins("user_token ON user_token.user_id = user.id AND user_token.uid = ?", claims.ID).First(user); res.Error != nil {
		return nil
	}

	return user
}

func AuthSignTemporaryEmail(user *models.User) string {
	return authSign(user, audienceTemporaryEmail, time.Hour*12)
}
func AuthSignCookie(c *gin.Context, user *models.User) bool {
	token := authSign(user, audienceLogin, time.Hour*24*30)
	if token == "" {
		return false
	}

	maxAge := 3600 * 24 * 30
	c.SetCookie(cookieName, token, maxAge, "/", cookieDomain, cookieHttpsOnly, true)

	return true
}
func authSign(user *models.User, audience string, expiresAt time.Duration) string {
	uid := uuid.NewV4().String()
	now := time.Now()
	claims := &jwt.RegisteredClaims{
		Audience:  jwt.Audience{audience},
		ID:        uid,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(expiresAt)),
	}
	builder := jwt.NewBuilder(signer)
	token, err := builder.Build(claims)
	if err != nil {
		return ""
	}

	DB.Create(&models.UserToken{
		UID:    uid,
		UserID: user.ID,
	})

	return token.String()
}

func AuthRevokeCookie(c *gin.Context) error {
	cookie, err := c.Cookie(cookieName)
	if err != nil {
		return err
	}
	tokenBytes := []byte(cookie)

	var claims jwt.RegisteredClaims
	if err := jwt.ParseClaims(tokenBytes, verifier, &claims); err != nil {
		return err
	}

	authRevoke(claims.ID)
	c.SetCookie(cookieName, "", -1, "", "", cookieHttpsOnly, true)

	return nil
}
func authRevoke(claimsID string) {
	DB.Where("uid = ?", claimsID).Delete(&models.UserToken{})
}
