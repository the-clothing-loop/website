package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/CollActionteam/clothing-loop/server/internal/views"
	glog "github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/guregu/null.v3/zero"
)

type ChainCreateRequestBody struct {
	Name             string   `json:"name" binding:"required"`
	Description      string   `json:"description"`
	Address          string   `json:"address" binding:"required"`
	Latitude         float64  `json:"latitude" binding:"required"`
	Longitude        float64  `json:"longitude" binding:"required"`
	Radius           float32  `json:"radius" binding:"required,gte=1.0,lte=70.0"`
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

	chain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE uid = ? LIMIT 1`, query.ChainUID).Scan(chain).Error
	if err != nil || chain.ID == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return
	}

	c.JSON(200, gin.H{
		"uid":                 chain.UID,
		"name":                chain.Name,
		"description":         chain.Description,
		"address":             chain.Address,
		"latitude":            chain.Latitude,
		"longitude":           chain.Longitude,
		"radius":              chain.Radius,
		"sizes":               chain.Sizes,
		"genders":             chain.Genders,
		"published":           chain.Published,
		"open_to_new_members": chain.OpenToNewMembers,
	})
}

func ChainGetAll(c *gin.Context) {
	db := getDB(c)

	var query struct {
		FilterSizes     []string `form:"filter_sizes"`
		FilterGenders   []string `form:"filter_genders"`
		FilterPublished bool     `form:"filter_out_unpublished"`
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

	if query.FilterPublished {
		tx.Where("chains.published = ?", true)
	}
	if res := tx.Find(&chains); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrChainNotFound)
		return
	}

	chainsJson := []*gin.H{}
	for _, chain := range chains {
		chainsJson = append(chainsJson, &gin.H{
			"uid":                 chain.UID,
			"name":                chain.Name,
			"description":         chain.Description,
			"address":             chain.Address,
			"latitude":            chain.Latitude,
			"longitude":           chain.Longitude,
			"radius":              chain.Radius,
			"sizes":               chain.Sizes,
			"genders":             chain.Genders,
			"published":           chain.Published,
			"open_to_new_members": chain.OpenToNewMembers,
		})
	}

	c.JSON(200, chainsJson)
}

func ChainUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UID              string    `json:"uid" binding:"required"`
		Name             *string   `json:"name,omitempty"`
		Description      *string   `json:"description,omitempty"`
		Address          *string   `json:"address,omitempty"`
		Latitude         *float32  `json:"latitude,omitempty"`
		Longitude        *float32  `json:"longitude,omitempty"`
		Radius           *float32  `json:"radius,omitempty"`
		Sizes            *[]string `json:"sizes,omitempty"`
		Genders          *[]string `json:"genders,omitempty"`
		Published        *bool     `json:"published,omitempty"`
		OpenToNewMembers *bool     `json:"open_to_new_members,omitempty"`
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

	valuesToUpdate := map[string]any{}
	if body.Name != nil {
		valuesToUpdate["name"] = *(body.Name)
	}
	if body.Description != nil {
		valuesToUpdate["description"] = *(body.Description)
	}
	if body.Address != nil {
		valuesToUpdate["address"] = *(body.Address)
	}
	if body.Latitude != nil {
		valuesToUpdate["latitude"] = *(body.Latitude)
	}
	if body.Longitude != nil {
		valuesToUpdate["longitude"] = *(body.Longitude)
	}
	if body.Radius != nil {
		valuesToUpdate["radius"] = *(body.Radius)
	}
	if body.Sizes != nil {
		j, _ := json.Marshal(body.Sizes)
		valuesToUpdate["sizes"] = string(j)
	}
	if body.Genders != nil {
		j, _ := json.Marshal(body.Genders)
		valuesToUpdate["genders"] = string(j)
	}
	if body.Published != nil {
		valuesToUpdate["published"] = *(body.Published)
	}
	if body.OpenToNewMembers != nil {
		valuesToUpdate["open_to_new_members"] = *(body.OpenToNewMembers)
	}

	if res := db.Model(chain).Updates(valuesToUpdate); res.Error != nil {
		glog.Error(res.Error)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to update loop values"))
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

	var ok bool
	var chain *models.Chain
	if body.IsChainAdmin {
		ok, _, chain = auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	} else {
		ok, _, _, chain = auth.AuthenticateUserOfChain(c, db, body.ChainUID, body.UserUID)
	}
	if !ok {
		return
	}

	user := models.User{}
	if res := db.Raw(`
SELECT * FROM users
WHERE uid = ? AND enabled = TRUE AND is_email_verified = TRUE
LIMIT 1
	`, body.UserUID).Scan(&user); res.Error != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrUserNotFound)
		return
	}

	userChain := &models.UserChain{}
	if res := db.Raw(`
SELECT * FROM user_chains
WHERE user_id = ? AND chain_id = ?
LIMIT 1
	`, user.ID, chain.ID).Scan(userChain); res.Error == nil {
		if (!userChain.IsChainAdmin && body.IsChainAdmin) || (userChain.IsChainAdmin && !body.IsChainAdmin) {
			userChain.IsChainAdmin = body.IsChainAdmin
			db.Save(userChain)
		}
	} else {
		if res := db.Create(&models.UserChain{
			UserID:       user.ID,
			ChainID:      chain.ID,
			IsChainAdmin: false,
		}); res.Error != nil {
			glog.Error(res.Error)
			gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("User could not be added to chain due to unknown error"))
			return
		}

		// find admin users related to the chain to email
		results := []struct {
			Name  string
			Email zero.String
		}{}
		db.Raw(`
SELECT users.name as name, users.email as email
FROM user_chains AS uc
LEFT JOIN users ON uc.user_id = users.id 
WHERE uc.chain_id = ?
	AND uc.is_chain_admin = TRUE
	AND users.enabled = TRUE
`, chain.ID).Scan(&results)

		if len(results) == 0 {
			glog.Errorf("Empty chain that is still public: ChainID: %d", chain.ID)
			gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("No admins exist for this loop"))
			return
		}

		for _, result := range results {
			if result.Email.Valid {
				go views.EmailAParticipantJoinedTheLoop(
					c,
					db,
					result.Email.String,
					result.Name,
					user.Name,
					user.Email.String,
					user.PhoneNumber,
					user.Address,
				)
			}
		}
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

	ok, user, _, chain := auth.AuthenticateUserOfChain(c, db, body.ChainUID, body.UserUID)
	if !ok {
		return
	}
	err := user.AddUserChainsToObject(db)
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, models.ErrAddUserChainsToObject)
		return
	}

	isUserChainAdmin := false
	for _, c := range user.Chains {
		if c.ChainID == chain.ID {
			isUserChainAdmin = c.IsChainAdmin
			break
		}
	}
	if !(isUserChainAdmin || user.IsRootAdmin || user.UID == body.UserUID) {
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Must be a chain admin or higher to remove a different user"))
		return
	}

	if res := db.Exec(`
DELETE FROM user_chains
WHERE user_id = (
	SELECT users.id
	FROM users
	WHERE users.uid = ?
) AND chain_id = ?
		`, body.UserUID,
		chain.ID); res.Error != nil {
		glog.Error(res.Error)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("User could not be removed from chain due to unknown error"))
		return
	}

	// remove chain if this is there are no more users of that chain
	db.Exec(`
UPDATE chains
SET chains.deleted_at = NOW(), chains.published = FALSE
WHERE chains.id IN (
	SELECT chains.id
	FROM chains
	LEFT JOIN user_chains ON user_chains.chain_id = chains.id
	GROUP BY user_chains.chain_id  
	HAVING COUNT(user_chains.id) = 0	AND chains.id = ?
)
	`, chain.ID)
}
