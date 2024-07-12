package controllers

import (
	"fmt"
	"log/slog"
	"math/rand/v2"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/shopspring/decimal"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/ring_ext"
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
	optimalPath, minimalCost := tsp.RunOptimizeRouteWithCitiesMST(cities.ToTspCities())

	c.JSON(200, gin.H{
		"minimal_cost": minimalCost,
		"optimal_path": optimalPath,
	})
}

func GetRouteCoordinates(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
		UserUID  string `form:"user_uid" binding:"omitempty,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	var ok bool
	var chain *models.Chain
	var authUser *models.User
	if query.UserUID == "" {
		// the authenticated user should be a chain admin
		ok, authUser, chain = auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	} else {
		ok, _, authUser, chain = auth.AuthenticateUserOfChain(c, db, query.ChainUID, query.UserUID)
	}
	if !ok {
		return
	}
	_, isChainAdmin := authUser.IsPartOfChain(query.ChainUID)
	if !(isChainAdmin || authUser.IsRootAdmin) && !chain.AllowMap {
		c.String(http.StatusNotAcceptable, "Map is hidden by the loop host")
		return
	}

	cities := retrieveChainUsersAsTspCities(db, chain.ID)

	type Response struct {
		UserUID    string  `json:"user_uid"`
		Latitude   float64 `json:"latitude"`
		Longitude  float64 `json:"longitude"`
		RouteOrder int     `json:"route_order"`
	}
	response := []Response{}
	r := ring_ext.NewWithValues(cities.FilterOutIsPausedToKeys(authUser.UID))
	slog.Debug("Chain route privacy", "chain uid", chain.UID, "route privacy", chain.RoutePrivacy)
	closeBy := ring_ext.GetSurroundingValues(r, authUser.UID, chain.RoutePrivacy)
	slog.Debug("chain surrounding", "closeBy", closeBy)
	for _, city := range cities.Arr {
		item := Response{
			UserUID:    city.Key,
			Latitude:   city.Latitude,
			Longitude:  city.Longitude,
			RouteOrder: city.RouteOrder,
		}
		isCloseBy := lo.Contains(closeBy, item.UserUID)
		isMe := authUser.UID == item.UserUID
		if !(isMe || isChainAdmin || authUser.IsRootAdmin || isCloseBy) {
			slog.Debug("Participant censorship", "uid", item.UserUID, "isChainAdmin", isChainAdmin, "isRootAdmin", authUser.IsRootAdmin, "isCloseBy", isCloseBy)
			item.UserUID = ""

			// Randomize the 5 & 6th decimal places
			item.Latitude = randomizeCoord(city.Latitude)
			item.Longitude = randomizeCoord(city.Longitude)
		}
		response = append(response, item)
	}

	c.JSON(http.StatusOK, response)
}

type TspCityWithIsPaused struct {
	tsp.City[string]
	IsPaused bool
}
type ArrTspCityWithIsPaused struct {
	Arr []TspCityWithIsPaused
}

func (a *ArrTspCityWithIsPaused) ToTspCities() []tsp.City[string] {
	result := []tsp.City[string]{}
	for _, v := range a.Arr {
		result = append(result, v.City)
	}
	return result
}

// removes all cities except me and where is_paused is false
func (a *ArrTspCityWithIsPaused) FilterOutIsPausedToKeys(me string) []string {
	result := []string{}
	for _, v := range a.Arr {
		if v.IsPaused && v.Key != me {
			continue
		}
		result = append(result, v.Key)
	}
	return result
}

func retrieveChainUsersAsTspCities(db *gorm.DB, chainID uint) *ArrTspCityWithIsPaused {
	allUserChains := ArrTspCityWithIsPaused{}

	err := db.Debug().Raw(fmt.Sprintf(`
	SELECT
		users.uid AS %skey%s,
		users.latitude AS latitude,
		users.longitude AS longitude,
		COALESCE(users.paused_until IS NOT NULL, user_chains.is_paused) AS is_paused
	FROM user_chains
	LEFT JOIN users ON user_chains.user_id = users.id
	WHERE user_chains.chain_id = ? 
	AND users.is_email_verified = TRUE 
	AND user_chains.is_approved = TRUE
	ORDER BY user_chains.route_order ASC`, "`", "`"), chainID).Scan(&allUserChains.Arr).Error
	if err != nil {
		slog.Error("Unable to retrieve associations between a loop and its users", "err", err)
		return nil
	}
	for i := range allUserChains.Arr {
		allUserChains.Arr[i].RouteOrder = i + 1
	}
	slog.Info("Retrieved chain users as tsp cities", "arr", allUserChains.Arr)

	return &allUserChains
}

// Randomize the 5 & 6th decimal places & remove all decimal places from 7 onwards
func randomizeCoord(coord float64) float64 {
	decimal.NewFromFloat(coord)
	dCoord := decimal.NewFromFloat(coord)

	// FLOOR(A1, 0.0001) + (FLOOR(RAND(), 0.01) / 10000)
	result := dCoord.RoundFloor(4).Add(
		decimal.NewFromFloat(rand.Float64()).RoundFloor(2).Div(decimal.NewFromInt(10000)),
	)

	return result.InexactFloat64()
}
