package controllers

import (
	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/CollActionteam/clothing-loop/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
)

func middlewareAuthCookieStart(c *gin.Context, minimumRole int, chainUID string) (ok bool, user *models.User, chain *models.Chain) {
	user = global.AuthValidateCookie(c)
	if user == nil {
		boom.Unathorized(c.Writer)
		return false, nil, nil
	}

	if chainUID == "" {
		// handle RoleUser
		// returns without looking up the chain as it is not necessary to authenticate just a basic user
		if minimumRole == models.RoleUser {
			return true, user, nil
		}
		// handle RoleAdmin where user chain is not required
		if minimumRole == models.RoleAdmin && user.Admin {
			return true, user, nil
		}

		boom.Teapot(c.Writer, "chainUID must not be empty _and_ require role ChainAdmin (2), this is should never happen")
		return false, nil, nil
	}

	global.DB.Where("uid = ?", chainUID).First(chain)

	user.AddUserChainsLLToObject(global.DB)

	// handle RoleAdmin
	if user.Admin == true {
		return true, user, chain
	}

	// handle RoleChainAdmin
	if minimumRole == models.RoleChainAdmin {
		for _, userChain := range user.Chains {
			if userChain.ChainID == chain.ID {
				if userChain.ChainAdmin || minimumRole == models.RoleUser {
					return true, user, chain
				}
				break
			}
		}
	}

	boom.Unathorized(c.Writer, "Role not high enough")
	return false, nil, nil
}

func middlewareAuthCookieEnd(c *gin.Context, user *models.User) (ok bool) {
	if ok = global.AuthSignCookie(c, user); !ok {
		boom.Internal(c.Writer)
		return false
	}
	return true
}
