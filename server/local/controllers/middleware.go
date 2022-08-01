package controllers

import (
	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getDB(c *gin.Context) *gorm.DB {
	db, ok := c.Get("DB")
	if !ok {
		panic("db is not instantiated")
	}

	return db.(*gorm.DB)
}
func MiddlewareSetDB(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("DB", db)
	}
}

func middlewareAuth(c *gin.Context, db *gorm.DB, minimumRole int, chainUID string) (ok bool, user *models.User, chain *models.Chain) {
	token, ok := auth.TokenReadFromRequest(c, db)
	if !ok {
		boom.BadRequest(c.Writer, "Token not received")
		return false, nil, nil
	}

	userID, ok := auth.TokenAuthenticate(db, token)
	if !ok {
		boom.Unathorized(c.Writer, "Invalid token")
		return false, nil, nil
	}

	db.First(user, userID)

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

	db.Where("uid = ?", chainUID).First(chain)

	user.AddUserChainsLLToObject(db)

	// handle RoleAdmin
	if user.Admin {
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
