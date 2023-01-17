package auth

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	glog "github.com/airbrake/glog/v4"
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Token not received"))
		return false, nil, nil
	}

	authUser, ok = TokenAuthenticate(db, token)
	if !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Invalid token"))
		return false, nil, nil
	}

	// 1. User of a different/unknown chain
	if minimumAuthState == AuthState1AnyUser && chainUID == "" {
		return true, authUser, nil
	}

	if chainUID == "" {
		glog.Error("ChainUID must not be empty _and_ require a minimum auth state of AuthState2UserOfChain (2), this is should never happen")
		gin_utils.GinAbortWithErrorBody(c, http.StatusTeapot, errors.New("ChainUID must not be empty _and_ require a minimum auth state of AuthState2UserOfChain (2), this is should never happen"))
		return false, nil, nil
	}

	chain = &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE chains.uid = ? AND chains.deleted_at IS NULL LIMIT 1`, chainUID).Scan(chain).Error
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return false, nil, nil
	}

	err = authUser.AddUserChainsToObject(db)
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, models.ErrAddUserChainsToObject)
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

	gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("User role not high enough"))
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("user UID must be set if chain UID is set"))
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
	user = &models.User{}
	if userUID != "" {
		err := db.Raw(`SELECT * FROM users WHERE uid = ? LIMIT 1`, userUID).Scan(user).Error
		if err == nil && user.ID != 0 {
			err = user.AddUserChainsToObject(db)
		}
		if err != nil {
			glog.Error(err)
		}
	}
	if user.ID == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("user UID must be set if chain UID is set"))
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

	gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Must be a chain admin or higher to alter a different user"))
	return false, nil, nil, nil
}
