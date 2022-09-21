package auth

import (
	"errors"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	AuthState0Guest          = 0
	AuthState1AnyUser        = 1
	AuthState2UserOfChain    = 2
	AuthState3AdminChainUser = 3
	AuthState4RootUser       = 4
)

// There are 4 different states to authenticate
// 0. Guest - this middleware is then not required
// 1. User of a different/unknown chain
// 2. User connected to the chain in question
// 3. Admin User of the chain in question
// 4. Root User
func Authenticate(c *gin.Context, db *gorm.DB, minimumAuthState int, chainUID string) (ok bool, user *models.User, chain *models.Chain) {
	// 0. Guest - this middleware is then not required
	if minimumAuthState == AuthState0Guest {
		return true, nil, nil
	}

	token, ok := TokenReadFromRequest(c)
	if !ok {
		c.AbortWithError(http.StatusBadRequest, errors.New("Token not received"))
		return false, nil, nil
	}

	user, ok = TokenAuthenticate(db, token)
	if !ok {
		c.AbortWithError(http.StatusUnauthorized, errors.New("Invalid token"))
		return false, nil, nil
	}

	// 1. User of a different/unknown chain
	if minimumAuthState == AuthState1AnyUser && chainUID == "" {
		return true, user, nil
	}

	if chainUID == "" {
		c.AbortWithError(http.StatusTeapot, errors.New("ChainUID must not be empty _and_ require a minimum auth state of AuthState2UserOfChain (2), this is should never happen"))
		return false, nil, nil
	}

	chain = &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE uid = ? LIMIT 1`, chainUID).Scan(chain).Error
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, models.ErrChainNotFound)
		return false, nil, nil
	}

	user.AddUserChainsToObject(db)

	// 4. Root User
	if user.IsRootAdmin {
		return true, user, chain
	}

	// 1. User of a different/unknown chain
	if minimumAuthState == AuthState1AnyUser {
		return true, user, chain
	}

	if minimumAuthState == AuthState2UserOfChain || minimumAuthState == AuthState3AdminChainUser {
		for _, userChain := range user.Chains {
			if userChain.ChainID == chain.ID {
				// 2. User connected to the chain in question
				if minimumAuthState == AuthState2UserOfChain {
					return true, user, chain
				}

				// 3. Admin User of the chain in question
				if minimumAuthState == AuthState3AdminChainUser && userChain.IsChainAdmin {
					return true, user, chain
				}
				break
			}
		}
	}

	c.AbortWithError(http.StatusUnauthorized, errors.New("User role not high enough"))
	return false, nil, nil
}
