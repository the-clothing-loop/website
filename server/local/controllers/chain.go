package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/CollActionteam/clothing-loop/server/local/app/auth"
	"github.com/CollActionteam/clothing-loop/server/local/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/CollActionteam/clothing-loop/server/local/views"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

type ChainCreateRequestBody struct {
	Name             string   `json:"name" binding:"required"`
	Description      string   `json:"description" binding:"required"`
	Address          string   `json:"address" binding:"required"`
	Latitude         float64  `json:"latitude" binding:"required"`
	Longitude        float64  `json:"longitude" binding:"required"`
	Radius           float32  `json:"radius" binding:"required"`
	OpenToNewMembers bool     `json:"open_to_new_members" binding:"required"`
	Sizes            []string `json:"sizes" binding:"required"`
	Genders          []string `json:"genders" binding:"required"`
}

func ChainCreate(c *gin.Context) {
	db := getDB(c)
	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	var body ChainCreateRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}
	if ok := models.ValidateAllSizeEnum(body.Sizes); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
		return
	}
	if ok := models.ValidateAllGenderEnum(body.Genders); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
		return
	}

	chain := models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             body.Name,
		Description:      body.Description,
		Address:          body.Address,
		Latitude:         body.Latitude,
		Longitude:        body.Longitude,
		Radius:           body.Radius,
		Published:        true,
		OpenToNewMembers: true,
		Sizes:            body.Sizes,
		Genders:          body.Genders,
		UserChains: []models.UserChain{
			{UserID: user.ID, IsChainAdmin: true},
		},
	}
	if res := db.Create(&chain); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to create chain"))
		return
	}

	c.Status(200)
}

func ChainGet(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	chain := models.Chain{}
	if res := db.First(&chain, "chains.uid = ?", query.ChainUID); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return
	}

	c.JSON(200, gin.H{
		"uid":              chain.UID,
		"name":             chain.Name,
		"description":      chain.Description,
		"address":          chain.Address,
		"latitude":         chain.Latitude,
		"longitude":        chain.Longitude,
		"radius":           chain.Radius,
		"sizes":            chain.Sizes,
		"genders":          chain.Genders,
		"published":        chain.Published,
		"openToNewMembers": chain.OpenToNewMembers,
	})
}

func ChainGetAll(c *gin.Context) {
	db := getDB(c)

	var query struct {
		FilterSizes   []string `form:"filter_sizes"`
		FilterGenders []string `form:"filter_genders"`
	}
	if err := c.ShouldBindQuery(&query); err != nil && err != io.EOF {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	if ok := models.ValidateAllSizeEnum(query.FilterSizes); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
		return
	}
	if ok := models.ValidateAllGenderEnum(query.FilterGenders); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
		return
	}

	chains := []models.Chain{}
	tx := db.Table("chains")

	// filter sizes and genders
	isGendersEmpty := len(query.FilterGenders) == 0
	isSizesEmpty := len(query.FilterSizes) == 0
	if !isSizesEmpty || !isGendersEmpty {
		var args []any
		var whereSql []string
		if !isSizesEmpty {
			for _, size := range query.FilterSizes {
				whereSql = append(whereSql, "chains.sizes LIKE ?")
				args = append(args, fmt.Sprintf("%%%s%%", size))
			}
		}
		if !isGendersEmpty {
			for _, gender := range query.FilterGenders {
				whereSql = append(whereSql, "chains.genders LIKE ?")
				args = append(args, fmt.Sprintf("%%%s%%", gender))
			}
		}

		tx.Where(strings.Join(whereSql, " AND "), args...)
	}

	tx.Where("chains.published = ?", true)
	if res := tx.Find(&chains); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return
	}

	chainsJson := []*gin.H{}
	for _, chain := range chains {
		chainsJson = append(chainsJson, &gin.H{
			"uid":              chain.UID,
			"name":             chain.Name,
			"description":      chain.Description,
			"address":          chain.Address,
			"latitude":         chain.Latitude,
			"longitude":        chain.Longitude,
			"radius":           chain.Radius,
			"sizes":            chain.Sizes,
			"genders":          chain.Genders,
			"published":        chain.Published,
			"openToNewMembers": chain.OpenToNewMembers,
		})
	}

	c.JSON(200, chainsJson)
}

func ChainUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UID         string    `json:"uid" binding:"required"`
		Name        *string   `json:"name"`
		Description *string   `json:"description"`
		Address     *string   `json:"address"`
		Latitude    *float32  `json:"latitude"`
		Longitude   *float32  `json:"longitude"`
		Radius      *float32  `json:"radius"`
		Sizes       *[]string `json:"sizes"`
		Genders     *[]string `json:"genders"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	if body.Sizes != nil {
		if ok := models.ValidateAllSizeEnum(*(body.Sizes)); !ok {
			gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrSizeInvalid)
			return
		}
	}
	if body.Genders != nil {
		if ok := models.ValidateAllGenderEnum(*(body.Genders)); !ok {
			gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
			return
		}
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.UID)
	if !ok {
		return
	}

	optionalValues := map[string]any{
		"name":        body.Name,
		"description": body.Description,
		"address":     body.Address,
		"latitude":    body.Latitude,
		"longitude":   body.Longitude,
		"radius":      body.Radius,
		"sizes":       body.Sizes,
		"genders":     body.Genders,
	}
	valuesToUpdate := map[string]any{}
	for k := range optionalValues {
		v := optionalValues[k]

		if v != nil {
			if k == "sizes" || k == "genders" {
				j, _ := json.Marshal(&v)
				valuesToUpdate[k] = string(j)
			} else {
				valuesToUpdate[k] = v
			}
		}
	}

	if res := db.Model(chain).Updates(valuesToUpdate); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Internal Server Error"))
	}
}

func ChainAddUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UserUID      string `json:"user_uid" binding:"required,uuid"`
		ChainUID     string `json:"chain_uid" binding:"required,uuid"`
		IsChainAdmin bool   `json:"is_chain_admin"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	minimumAuthState := auth.AuthState2UserOfChain
	if body.IsChainAdmin {
		minimumAuthState = auth.AuthState3AdminChainUser
	}
	ok, _, chain := auth.Authenticate(c, db, minimumAuthState, body.ChainUID)
	if !ok {
		return
	}

	var user models.User
	if res := db.Where("uid = ? AND enabled = ? AND email_verified = ?", body.UserUID, true, true).First(&user); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrUserNotFound)
		return
	}

	if !chain.OpenToNewMembers {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("This loop is not currently open to new members"))
		return
	}

	if res := db.Where("user_id = ? AND chain_id = ?", user.ID, chain.ID).First(&models.UserChain{}); res.Error == nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("This user is already a member"))
	}

	if res := db.Create(&models.UserChain{
		UserID:       user.ID,
		ChainID:      chain.ID,
		IsChainAdmin: false,
	}); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("User could not be added to chain due to unknown error"))
		return
	}

	var results []struct {
		Name  string
		Email string
	}
	db.Raw(`
SELECT users.name as name, users.email as email
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id 
WHERE user_chains.chain_id = ?
	AND user_chains.is_chain_admin = ?
	AND users.enabled = ?
`, chain.ID, true, true).Scan(&results)

	if len(results) == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("No admins exist for this loop"))
		return
	}

	for _, result := range results {
		go views.EmailAParticipantJoinedTheLoop(
			c,
			db,
			result.Email,
			result.Name,
			user.Name,
			user.Email,
			user.PhoneNumber,
		)
	}
}

func ChainRemoveUser(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UserUID  string `json:"user_uid" binding:"required,uuid"`
		ChainUID string `json:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	minimumAuthState := auth.AuthState2UserOfChain
	ok, user, chain := auth.Authenticate(c, db, minimumAuthState, body.ChainUID)
	if !ok {
		return
	}
	user.AddUserChainsToObject(db)
	isUserChainAdmin := false
	for _, c := range user.Chains {
		if c.ChainID == chain.ID {
			isUserChainAdmin = c.IsChainAdmin
			break
		}
	}
	if !isUserChainAdmin && user.UID != body.UserUID {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Must be a chain admin or higher to remove a different user"))
		return
	}

	if res := db.Exec(`DELETE FROM user_chains WHERE user_id = ? AND chain_id = ?`, user.ID,
		chain.ID); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("User could not be removed from chain due to unknown error"))
		return
	}

	// remove chain if this is there are no more users of that chain
	db.Exec(`
DELETE FROM chains
WHERE chains.id IN (
	SELECT chains.id
	FROM chains
	LEFT JOIN user_chains ON user_chains.chain_id = chains.id
	WHERE chains.id = ?
	HAVING COUNT(user_chains.id) = 0
)
	`, chain.ID)
}
