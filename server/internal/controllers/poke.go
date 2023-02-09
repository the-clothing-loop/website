package controllers

import (
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/views"
	"github.com/gin-gonic/gin"
)

func Poke(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("err: %v, uri: %v", err, query))
		return
	}

	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, query.UserUID)
	if !ok {
		return
	}

	if ok := !user.LastPokeTooRecent(); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusTooManyRequests, fmt.Errorf("Please wait a day before poking again"))
		return
	}

	found := -1
	db.Raw(`
SELECT COUNT(*) FROM user_chains AS uc
LEFT JOIN chains AS c ON c.id = uc.chain_id AND uc.uid = ?
WHERE user_id = ?
	`, query.ChainUID, user.ID).Scan(&found)
	if found < 1 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, fmt.Errorf("Loop has no connection to this account"))
		return
	}

	go views.EmailPoke(
		c,
		db,
		user.Name,
		user.Email.String,
	)
}
