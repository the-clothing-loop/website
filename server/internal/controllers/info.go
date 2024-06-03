package controllers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
	"github.com/the-clothing-loop/website/server/internal/app"
)

func InfoGet(c *gin.Context) {
	db := getDB(c)

	type Info struct {
		TotalChains    int `json:"total_chains" gorm:"total_chains"`
		TotalUsers     int `json:"total_users" gorm:"total_users"`
		TotalCountries int `json:"total_countries" gorm:"total_countries"`
	}

	data := Info{}

	foundCache := false
	if c, found := app.Cache.Get("info"); found {
		d, ok := c.(Info)
		if ok {
			data = d
			foundCache = true
		}
	}
	if !foundCache {
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
	WHERE country_code IS NOT NULL AND chains.published = TRUE
) as total_countries;
		`).Scan(&data).Error
		if err != nil {
			slog.Error("Unable to retrieve information", "err", err)
			c.String(http.StatusInternalServerError, "Unable to retrieve information")
			return
		}

		app.Cache.Add("info", data, cache.DefaultExpiration)
	}

	c.JSON(200, data)
}

func Ping(c *gin.Context) {
	c.String(200, "pong")
}
