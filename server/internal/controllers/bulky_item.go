package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
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

	bulkyItems := []models.BulkyItem{}
	err := db.Raw(`
	SELECT 
	bulky_items.id            AS id,
	bulky_items.title         AS title,
	bulky_items.message       AS message,
	bulky_items.image_url     AS image_url,
	bulky_items.user_chain_id AS user_chain_id,
	c.uid               AS chain_uid,
	u.uid               AS user_uid,
	bulky_items.created_at    AS created_at
 FROM bulky_items
LEFT JOIN user_chains AS uc ON uc.id = bulky_items.user_chain_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE user_chain_id IN (
	SELECT uc2.id FROM user_chains AS uc2
	WHERE uc2.chain_id = ?
)
	`, chain.ID).Scan(&bulkyItems).Error
	if err != nil {
		goscope.Log.Errorf("Unable to find bulky items: %v", err)
		c.String(http.StatusInternalServerError, "Unable to find bulky items")
		return
	}

	c.JSON(http.StatusOK, bulkyItems)
}

func BulkyPut(c *gin.Context) {
	db := getDB(c)
	var body struct {
		ID       uint    `json:"id,omitempty"`
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

	bulkyItem := &models.BulkyItem{}
	if body.ID != 0 {
		db.Raw(`SELECT * FROM bulky_items WHERE id = ? LIMIT 1`, body.ID).Scan(bulkyItem)
	}
	if body.Title != nil {
		bulkyItem.Title = *(body.Title)
	}
	if body.Message != nil {
		bulkyItem.Message = *(body.Message)
	}
	if body.ImageUrl != nil {
		bulkyItem.ImageUrl = *(body.ImageUrl)
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
	bulkyItem.UserChainID = ucID

	var err error
	if bulkyItem.ID == 0 {
		err = db.Create(bulkyItem).Error
	} else {
		err = db.Updates(*bulkyItem).Error
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
DELETE FROM bulky_items
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

func BulkyUploadImage(c *gin.Context) {
	db := getDB(c)
	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	res, err := app.ImgBBupload(c)
	if err != nil {
		goscope.Log.Warningf("Unable to upload image: %v", err)
		c.String(http.StatusBadRequest, "Unable to upload image")
		return
	}

	if !res.Success {
		goscope.Log.Warningf("Unable to upload image: %v", res)
		c.String(http.StatusBadRequest, "Unable to upload image")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"delete": res.Data.DeleteURL,
		"image":  res.Data.Image.Url,
		"thumb":  res.Data.Thumb.Url,
	})
}
