package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3/zero"
)

func BulkyGetAll(c *gin.Context) {
	db := getDB(c)
	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	bulky := []models.Bulky{}
	err := db.Raw(`
	SELECT 
	bulky.id            AS id,
	bulky.title         AS title,
	bulky.message       AS message,
	bulky.image_url     AS image_url,
	bulky.user_chain_id AS user_chain_id,
	c.uid               AS chain_uid,
	u.uid               AS user_uid,
	bulky.created_at    AS created_at
 FROM bulky
LEFT JOIN user_chains AS uc ON uc.id = bulky.user_chain_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE user_chain_id IN (
	SELECT uc2.id FROM user_chains AS uc2
	WHERE uc2.chain_id = ?
)
	`, chain.ID).Scan(&bulky).Error
	if err != nil {
		goscope.Log.Errorf("Unable to find bags: %v", err)
		c.String(http.StatusInternalServerError, "Unable to find bags")
		return
	}

	c.JSON(http.StatusOK, bulky)
}

func BulkyPut(c *gin.Context) {
	db := getDB(c)
	var body struct {
		ID       *uint   `json:"id,omitempty"`
		UserUID  string  `json:"user_uid" binding:"required,uuid"`
		ChainUID string  `json:"chain_uid" binding:"required,uuid"`
		Title    *string `json:"title,omitempty"`
		Message  *string `json:"message,omitempty"`
		ImageUrl *string `json:"image_url,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	bulky := models.Bulky{}
	if body.ID != nil {
		db.Raw(`SELECT * FROM bulky WHERE id = ? LIMIT 1`, body.ID).Scan(&bulky)
	}
	if body.Title != nil {
		bulky.Title = *(body.Title)
	}
	if body.Message != nil {
		bulky.Message = *(body.Message)
	}
	if body.ImageUrl != nil {
		bulky.ImageUrl = zero.StringFrom(*(body.ImageUrl))
	}

	ucID := uint(0)
	db.Raw(`
SELECT uc.id FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE u.uid = ? AND uc.chain_id = ?
LIMIT 1
	`, body.UserUID, chain.ID).Scan(&ucID)
	if ucID == 0 {
		c.String(http.StatusExpectationFailed, "Author does not exist")
		return
	}
	bulky.UserChainID = ucID

	var err error
	if bulky.ID == 0 {
		err = db.Create(&bulky).Error
	} else {
		err = db.Save(&bulky).Error
	}
	if err != nil {
		goscope.Log.Errorf("Unable to create or update bulky item: %v", err)
		c.String(http.StatusInternalServerError, "Unable to create or update bulky item")
		return
	}
}

func BulkyRemove(c *gin.Context) {
	db := getDB(c)
	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
		ID       uint   `form:"id" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	err := db.Exec(`
DELETE FROM bulky
WHERE id = ? AND user_chain_id IN (
	SELECT id FROM user_chains
	WHERE chain_id = ?
)
	`, query.ID, chain.ID).Error
	if err != nil {
		goscope.Log.Errorf("Bulky Item could not be removed: %v", err)
		c.String(http.StatusInternalServerError, "Bulky Item could not be removed")
		return
	}
}
