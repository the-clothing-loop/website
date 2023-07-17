package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
)

func InfoGet(c *gin.Context) {
	db := getDB(c)

	totalChains := 0
	err := db.Raw(`
SELECT COUNT(chains.id)
FROM chains
WHERE chains.published = TRUE AND chains.deleted_at IS NULL
	`).Scan(&totalChains).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve information: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	totalUsers := 0
	err = db.Raw(`
SELECT COUNT(users.id)
FROM users
WHERE users.is_email_verified = TRUE
	`).Scan(&totalUsers).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve information: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	totalCountries := 0
	err = db.Raw(`
SELECT COUNT(DISTINCT country_code)
FROM chains
WHERE country_code IS NOT NULL
	`).Scan(&totalCountries).Error
	if err != nil {
		goscope.Log.Errorf("Unable to retrieve information: %v", err)
		c.String(http.StatusInternalServerError, "Unable to retrieve information")
		return
	}

	c.JSON(200, gin.H{
		"total_chains":    totalChains,
		"total_users":     totalUsers,
		"total_countries": totalCountries,
	})
}
