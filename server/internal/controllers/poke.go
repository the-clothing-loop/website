package controllers

import (
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/views"
	"github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
)

func Poke(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `json:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, fmt.Errorf("err: %v, uri: %v", err, query))
		return
	}

	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	if user.LastPokeTooRecent() {
		gin_utils.GinAbortWithErrorBody(c, http.StatusTooManyRequests, fmt.Errorf("Please wait a week before poking again"))
		return
	}

	userAdmins := []struct {
		Name      string `gorm:"name"`
		Email     string `gorm:"email"`
		ChainName string `gorm:"chain_name"`
	}{}
	db.Raw(`
SELECT u.name AS name, u.email AS email, c.name AS chain_name FROM users AS u
LEFT JOIN user_chains AS uc ON u.id = uc.user_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
WHERE uc.is_chain_admin = TRUE AND u.email IS NOT NULL AND uc.chain_id IN (
	SELECT uc2.chain_id FROM user_chains AS uc2
	LEFT JOIN chains AS c2 ON c2.id = uc2.chain_id
	WHERE c2.uid = ?
	AND uc2.user_id = ?
	AND uc2.is_approved = FALSE
)

	`, query.ChainUID, user.ID).Scan(&userAdmins)
	if len(userAdmins) < 1 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, fmt.Errorf("Unable to poke this Loop"))
		return
	}

	for _, v := range userAdmins {
		go views.EmailPoke(
			c,
			db,
			v.Name,
			v.Email,
			user.Name,
			v.ChainName,
		)
	}

	if err := user.SetLastPokeToNow(db); err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, err)
		return
	}
}
