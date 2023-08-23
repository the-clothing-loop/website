package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
)

func InfoGet(c *gin.Context) {
	db := getDB(c)

	data := struct {
		TotalChains    int `json:"total_chains" gorm:"total_chains"`
		TotalUsers     int `json:"total_users" gorm:"total_users"`
		TotalCountries int `json:"total_countries" gorm:"total_countries"`
	}{}
	err := db.Raw(`
SELECT (
	SELECT COUNT(chains.id)
	FROM chains
	WHERE chains.published = TRUE AND chains.deleted_at IS NULL
) as total_chains, (
	SELECT COUNT(users.id)
	FROM users
	WHERE users.is_email_verified = TRUE
) as total_users,	(
	SELECT COUNT(DISTINCT country_code)
	FROM chains
	WHERE country_code IS NOT NULL
) as total_countries;
	`).Scan(&data).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve information: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	c.JSON(200, data)
}
