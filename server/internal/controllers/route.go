package controllers

import (
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/gin-gonic/gin"
)

func RouteOrderGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

	routeOrder, err := chain.GetRouteOrderByUserUID(db)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
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
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

	err := chain.SetRouteOrderByUserUIDs(db, query.RouteOrder)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return
	}
}
