package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/tsp"
	"gorm.io/gorm"
)

func RouteOrderGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	routeOrder, err := chain.GetRouteOrderByUserUID(db)
	if err != nil {
		c.String(http.StatusBadRequest, models.ErrChainNotFound.Error())
		return
	}

	c.JSON(200, routeOrder)
}

func RouteOrderSet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID   string   `json:"chain_uid" binding:"required"`
		RouteOrder []string `json:"route_order" binding:"required"`
	}
	if err := c.ShouldBindJSON(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	err := chain.SetRouteOrderByUserUIDs(db, query.RouteOrder)
	if err != nil {
		c.String(http.StatusBadRequest, models.ErrChainNotFound.Error())
		return
	}
}

func RouteOptimize(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	// the authenticated user should be a chain admin
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

	// Given a ChainUID return an optimized route for all the approved participant of the loop
	// with latitude and longitude.
	cities := retrieveChainUsersAsTspCities(db, chain.ID)
	minimalCost, optimalPath := tsp.RunOptimizeRouteWithCitiesMST[string](cities)

	c.JSON(200, gin.H{
		"minimal_cost": minimalCost,
		"optimal_path": optimalPath,
	})
}

func retrieveChainUsersAsTspCities(db *gorm.DB, ChainID uint) []tsp.City[string] {
	allUserChains := &[]tsp.City[string]{}

	err := db.Raw(`
	SELECT
		users.uid AS Key,
		users.latitude AS Latitude,
		users.longitude AS Longitude,
		user_chains.route_order AS RouteOrder
	FROM user_chains
	LEFT JOIN users ON user_chains.user_id = users.id
	WHERE user_chains.chain_id = ? 
	AND users.is_email_verified = TRUE 
	AND user_chains.is_approved = TRUE
	AND users.latitude <> 0 AND users.longitude <> 0 
	ORDER BY user_chains.route_order ASC`, ChainID).Scan(allUserChains).Error

	if err != nil {
		goscope.Log.Errorf("Unable to retrieve associations between a loop and its users: %v", err)
		return nil
	}
	return *allUserChains
}
