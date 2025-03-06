package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
	"github.com/the-clothing-loop/website/server/internal/app"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

func InfoGet(c *gin.Context) {
	db := getDB(c)

	data, err := app.CacheFindOrUpdate[sharedtypes.Info]("info", cache.DefaultExpiration, func() (*sharedtypes.Info, error) {
		data := sharedtypes.Info{}
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
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to retrieve information")
		return
	}

	c.JSON(200, data)
}

func InfoTopTen(c *gin.Context) {
	db := getDB(c)

	data, err := app.CacheFindOrUpdate("info", cache.DefaultExpiration, func() (*[]sharedtypes.InfoTopLoop, error) {
		data := []sharedtypes.InfoTopLoop{}
		err := db.Raw(`
SELECT uid, name, description, COUNT(uc.id) AS members_count
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
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to retrieve information")
		return
	}

	c.JSON(200, data)
}

func Ping(c *gin.Context) {
	c.String(200, "pong")
}
