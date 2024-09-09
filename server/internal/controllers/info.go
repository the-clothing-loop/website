package controllers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
	"github.com/the-clothing-loop/website/server/internal/app"
)

type InfoTopLoop struct {
	UID          string `json:"uid" gorm:"uid"`
	Name         string `json:"name" gorm:"name"`
	MembersCount int    `json:"members_count" gorm:"members_count"`
}

type Info struct {
	TotalChains    int `json:"total_chains" gorm:"total_chains"`
	TotalUsers     int `json:"total_users" gorm:"total_users"`
	TotalCountries int `json:"total_countries" gorm:"total_countries"`
}

func InfoGet(c *gin.Context) {
	db := getDB(c)

	data, err := app.CacheFindOrUpdate[Info]("info", cache.DefaultExpiration, func() (*Info, error) {
		data := Info{}
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
			return nil, err
		}
		return &data, nil
	})
	if err != nil {
		slog.Error("Unable to retrieve information", "err", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	c.JSON(200, data)
}

func InfoTopTen(c *gin.Context) {
	db := getDB(c)

	data, err := app.CacheFindOrUpdate[[]InfoTopLoop]("info", cache.DefaultExpiration, func() (*[]InfoTopLoop, error) {
		data := []InfoTopLoop{}
		err := db.Raw(`
SELECT uid, name, COUNT(uc.id) AS members_count
FROM chains
JOIN user_chains AS uc ON uc.chain_id = chains.id AND uc.is_approved = TRUE
GROUP BY chains.id
ORDER BY members_count DESC
LIMIT 10
	`).Scan(&data).Error
		if err != nil {
			return nil, err
		}
		return &data, nil
	})

	if err != nil {
		slog.Error("Unable to retrieve information", "err", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	c.JSON(200, data)
}

func Ping(c *gin.Context) {
	c.String(200, "pong")
}
