package auth

import (
	"net/http"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"

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
func Authenticate(c *gin.Context, db *gorm.DB, minimumAuthState int, chainUID string) (ok bool, authUser *models.User, chain *models.Chain) {
	// 0. Guest - this middleware is then not required
	if minimumAuthState == AuthState0Guest {
		return true, nil, nil
	}

	token, ok := TokenReadFromRequest(c)
	if !ok {
		c.String(http.StatusUnauthorized, "Token not received")
		return false, nil, nil
	}

	authUser, ok = TokenAuthenticate(db, token)
	if !ok {
		c.String(http.StatusUnauthorized, "Invalid token")
		return false, nil, nil
	}

	// 1. User of a different/unknown chain
	if minimumAuthState == AuthState1AnyUser && chainUID == "" {
		return true, authUser, nil
	}

	if chainUID == "" {
		goscope.Log.Errorf("ChainUID must not be empty _and_ require a minimum auth state of AuthState2UserOfChain (2), this is should never happen")
		c.String(http.StatusNotImplemented, "ChainUID must not be empty _and_ require a minimum auth state of AuthState2UserOfChain (2), this is should never happen")
		return false, nil, nil
	}

	chain = &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE chains.uid = ? AND chains.deleted_at IS NULL LIMIT 1`, chainUID).Scan(chain).Error
	if err != nil {
		c.String(http.StatusBadRequest, models.ErrChainNotFound.Error())
		return false, nil, nil
	}

	err = authUser.AddUserChainsToObject(db)
	if err != nil {
		goscope.Log.Errorf("%v: %v", models.ErrAddUserChainsToObject, err)
		c.String(http.StatusInternalServerError, models.ErrAddUserChainsToObject.Error())
		return false, nil, nil
	}

	// 4. Root User
	if authUser.IsRootAdmin {
		return true, authUser, chain
	}

	// 1. User of a different/unknown chain
	if minimumAuthState == AuthState1AnyUser {
		return true, authUser, chain
	}

	if minimumAuthState == AuthState2UserOfChain || minimumAuthState == AuthState3AdminChainUser {
		for _, userChain := range authUser.Chains {
			if userChain.ChainID == chain.ID {
				// 2. User connected to the chain in question
				if minimumAuthState == AuthState2UserOfChain {
					return true, authUser, chain
				}

				// 3. Admin User of the chain in question
				if minimumAuthState == AuthState3AdminChainUser && userChain.IsChainAdmin {
					return true, authUser, chain
				}
				break
			}
		}
	}

	c.String(http.StatusUnauthorized, "User role not high enough")
	return false, nil, nil
}

// This runs Authenticate and defines minimumAuthState depending on the input
// Any of the following rules pass authentication
//
// 1. authUser UID is the same as the given userUID
// 2. authUser is a chain admin of chain and user is part that same chain
// 3. authUser is a root admin
func AuthenticateUserOfChain(c *gin.Context, db *gorm.DB, chainUID, userUID string) (ok bool, user, authUser *models.User, chain *models.Chain) {
	if chainUID != "" && userUID == "" {
		c.String(http.StatusBadRequest, "user UID must be set if chain UID is set")
		return false, nil, nil, nil
	}

	ok, authUser, chain = Authenticate(c, db, AuthState1AnyUser, chainUID)
	if !ok {
		return ok, nil, nil, nil
	}

	// 1. authUser UID is the same as the given userUID
	// 3. authUser is a root admin
	if authUser.UID == userUID || (authUser.IsRootAdmin && userUID == "") {
		return true, authUser, authUser, chain
	}

	// get user
	exist, user, err := models.UserGetByUID(db, userUID, false)
	if err == nil && user.ID != 0 {
		err = user.AddUserChainsToObject(db)
	}
	if err != nil {
		goscope.Log.Errorf("%v", err)
	}

	if !exist {
		c.String(http.StatusBadRequest, "user UID must be set if chain UID is set")
		return false, nil, nil, nil
	}

	// 3. authUser is a root admin
	if authUser.IsRootAdmin {
		return true, user, authUser, chain
	}

	_, isAuthUserChainAdmin := authUser.IsPartOfChain(chainUID)
	isUserPartOfChain, _ := user.IsPartOfChain(chainUID)

	//	2. authUser is a chain admin of chain and user is part of chain
	if isAuthUserChainAdmin && isUserPartOfChain {
		return true, user, authUser, chain
	}

	c.String(http.StatusUnauthorized, "Must be a chain admin or higher to alter a different user")
	return false, nil, nil, nil
}

func AuthenticateEvent(c *gin.Context, db *gorm.DB, eventUID string) (ok bool, authUser *models.User, event *models.Event) {
	ok, authUser, _ = Authenticate(c, db, AuthState1AnyUser, "")
	if !ok {
		return false, nil, nil
	}

	event = &models.Event{}
	err := db.Raw(models.EventGetSql+`WHERE events.uid = ? LIMIT 1`, eventUID).Scan(event).Error
	if err != nil {
		c.String(http.StatusNotFound, "event not found")
		return false, nil, nil
	}

	if event.UserID == authUser.ID || authUser.IsRootAdmin {
		return true, authUser, event
	} else if event.ChainUID.Valid {
		err = authUser.AddUserChainsToObject(db)
		if err != nil {
			goscope.Log.Errorf("%v", err)
			c.String(http.StatusInternalServerError, "Unable to retrieve user related loops")
			return false, nil, nil
		}

		_, isChainAdmin := authUser.IsPartOfChain(event.ChainUID.String)
		if isChainAdmin {
			return true, authUser, event
		}
	}

	c.String(http.StatusUnauthorized, "user must be connected to event")
	return false, nil, nil
}
