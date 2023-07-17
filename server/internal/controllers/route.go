package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/tsp"
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

	minimalCost, optimalPath := tsp.OptimizeRoute(chain.ID, db)

	result := struct {
		MinimalCost float64  `json:"minimal_cost"`
		OptimalPath []string `json:"optimal_path"`
	}{
		MinimalCost: minimalCost,
		OptimalPath: optimalPath,
	}

	c.JSON(200, &result)
}
