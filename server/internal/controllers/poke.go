package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/views"
)

func Poke(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `json:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	if user.LastPokeTooRecent() {
		c.String(http.StatusTooManyRequests, "Please wait a week before poking again")
		return
	}

	userAdmins := []struct {
		Name      string `gorm:"name"`
		Email     string `gorm:"email"`
		ChainName string `gorm:"chain_name"`
		I18n      string `gorm:"i18n"`
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
		c.String(http.StatusUnauthorized, "Unable to poke this Loop")
		return
	}

	for _, v := range userAdmins {
		go views.EmailPoke(db, v.I18n,
			v.Name,
			v.Email,
			user.Name,
			v.ChainName,
		)
	}

	if err := user.SetLastPokeToNow(db); err != nil {
		goscope.Log.Errorf("Unable to poke this Loop: %v", err)
		c.String(http.StatusInternalServerError, "Unable to poke this Loop")
		return
	}
}
