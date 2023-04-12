package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
)

func BagGetAll(c *gin.Context) {
	db := getDB(c)
	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, _, chain := auth.AuthenticateUserOfChain(c, db, query.ChainUID, query.UserUID)
	if !ok {
		return
	}

	bags := []models.Bag{}
	err := db.Raw(`
SELECT (
	bags.id AS id,
	bags.number AS number,
	bags.color AS color,
	bags.user_chain_id AS user_chain_id,
	c.uid AS chain_uid,
	u.uid As user_uid,
) FROM bags
LEFT JOIN user_chains AS uc ON uc.id = user_chain_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE user_chain_id IN (
	SELECT uc2.id FROM user_chains AS uc2
	WHERE uc2.chain_id = ?
)
	`, chain.ID).Scan(bags).Error
	if err != nil {
		goscope.Log.Errorf("Unable to find bags: %v", err)
		c.String(http.StatusInternalServerError, "Unable to find bags")
		return
	}

	c.JSON(http.StatusOK, bags)
}

func BagPut(c *gin.Context) {
	db := getDB(c)
	var body struct {
		UserUID  string  `json:"user_uid" binding:"required,uuid"`
		ChainUID string  `json:"chain_uid" binding:"required,uuid"`
		Number   *int    `json:"number,omitempty"`
		Color    *string `json:"color,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, _, chain := auth.AuthenticateUserOfChain(c, db, body.ChainUID, body.UserUID)
	if !ok {
		return
	}

	bag := models.Bag{}
	if body.Number != nil {
		db.Raw(`
	SELECT bags.* FROM bags
	LEFT JOIN user_chains AS uc ON uc.id = bags.user_chain_id
	WHERE bags.number = ? AND uc.chain_id = ?
	LIMIT 1
		`, body.Number, chain.ID)
	}

	if bag.ID == 0 && body.Number != nil {
		c.String(http.StatusConflict, "Not allowed to change an existing bag number")
		return
	}
	if body.Number != nil {
		bag.Number = *(body.Number)
	}
	if body.Color != nil {
		bag.Color = *(body.Color)
	}
	for _, uc := range user.Chains {
		if uc.UserID == user.ID {
			bag.UserChainID = uc.ID
		}
	}
	db.Save(bag)
}

func BagRemove(c *gin.Context) {
	db := getDB(c)
	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
		Number   int    `form:"number" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, _, chain := auth.AuthenticateUserOfChain(c, db, query.ChainUID, query.UserUID)
	if !ok {
		return
	}

	err := db.Exec(`
DELETE FROM bags
WHERE number = ? AND user_chain_id IN (
	SELECT id FROM user_chains
	WHERE chain_id = ?
)
	`, query.Number, chain.ID).Error
	if err != nil {
		goscope.Log.Errorf("Bag could not be removed: %v", err)
		c.String(http.StatusInternalServerError, "Bag could not be removed")
		return
	}
}
