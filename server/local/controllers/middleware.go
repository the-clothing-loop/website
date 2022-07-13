package controllers

import (
	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/CollActionteam/clothing-loop/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
)

// -
// - result chain: if chainUID is empty the result chain will be nil
func middlewareAuthCookieStart(c *gin.Context, minimumRole int) (ok bool, user *models.User) {
	user = global.AuthValidateCookie(c)
	if user == nil {
		boom.Unathorized(c.Writer)
		return false, nil
	}
	if minimumRole <= user.Role {
		boom.Unathorized(c.Writer, "Role not high enough")
		return false, nil
	}

	return true, user
}

func middlewareAuthCheckChainRelation(c *gin.Context, user *models.User, chainUID string) (ok bool, chain *models.Chain) {
	global.DB.Where("uid = ? AND published = ?", chainUID, true).First(chain)
	if chain == nil {
		boom.Unathorized(c.Writer, "Loop does not exist")
		return false, nil
	}

	// check if user is chain admin or admin
	if user.Role != models.RoleAdmin {
		var userChain *models.UserChainLL
		global.DB.Where("chain_id = ? AND user_id = ?", chain.ID, user.ID).First(userChain)
		if userChain == nil || userChain.ChainAdmin == false {
			boom.Unathorized(c.Writer, "User does not have an administrative role at this Loop")
			return false, nil
		}
	}

	return true, chain
}

func middlewareAuthCookieEnd(c *gin.Context, user *models.User) (ok bool) {
	if ok = global.AuthSignCookie(c, user); !ok {
		boom.Internal(c.Writer)
		return false
	}
	return true
}
