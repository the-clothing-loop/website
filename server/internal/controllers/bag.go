package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3/zero"
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
	err := db.Raw(fmt.Sprintf(`
SELECT
	bags.id            AS id,
	bags.%snumber%s    AS %snumber%s,
	bags.color         AS color,
	bags.user_chain_id AS user_chain_id,
	c.uid              AS chain_uid,
	u.uid              AS user_uid,
	bags.updated_at    AS updated_at
FROM bags
LEFT JOIN user_chains AS uc ON uc.id = bags.user_chain_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE user_chain_id IN (
	SELECT uc2.id FROM user_chains AS uc2
	WHERE uc2.chain_id = ?
)
ORDER BY id ASC
	`, "`", "`", "`", "`"), chain.ID).Scan(&bags).Error
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
		UserUID   string     `json:"user_uid" binding:"required,uuid"`
		ChainUID  string     `json:"chain_uid" binding:"required,uuid"`
		BagID     int        `json:"bag_id,omitempty"`
		HolderUID string     `json:"holder_uid" binding:"required,uuid"`
		Number    *string    `json:"number,omitempty"`
		Color     *string    `json:"color,omitempty"`
		UpdatedAt *time.Time `json:"updated_at,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	bag := models.Bag{}
	if body.BagID != 0 {
		db.Raw(`
	SELECT bags.* FROM bags
	LEFT JOIN user_chains AS uc ON uc.id = bags.user_chain_id
	WHERE bags.id = ? AND uc.chain_id = ?
	LIMIT 1
		`, body.BagID, chain.ID).Scan(&bag)
	}
	if body.Number != nil {
		bag.Number = *(body.Number)
	}
	if body.Color != nil {
		bag.Color = *(body.Color)
	}
	if body.UpdatedAt != nil {
		bag.UpdatedAt = *(body.UpdatedAt)
	}
	bag.LastNotifiedAt = zero.Time{}

	ucID := uint(0)
	db.Raw(`
SELECT uc.id FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE u.uid = ? AND uc.chain_id = ?
LIMIT 1
	`, body.HolderUID, chain.ID).Scan(&ucID)
	if ucID == 0 {
		c.String(http.StatusExpectationFailed, "Bag holder does not exist")
		return
	}
	bag.UserChainID = ucID

	var err error
	if bag.ID == 0 {
		err = db.Create(&bag).Error
	} else {
		if body.UpdatedAt != nil {
			err = db.Model(&bag).UpdateColumns(&bag).Error
		} else {
			err = db.Save(&bag).Error
		}
	}
	if err != nil {
		goscope.Log.Errorf("Unable to create or update bag: %v", err)
		c.String(http.StatusInternalServerError, "Unable to create or update bag")
		return
	}
}

func BagRemove(c *gin.Context) {
	db := getDB(c)
	var query struct {
		UserUID  string `form:"user_uid" binding:"required,uuid"`
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
		BagID    int    `form:"bag_id" binding:"required"`
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
WHERE id = ? AND user_chain_id IN (
	SELECT id FROM user_chains
	WHERE chain_id = ?
)
	`, query.BagID, chain.ID).Error
	if err != nil {
		goscope.Log.Errorf("Bag could not be removed: %v", err)
		c.String(http.StatusInternalServerError, "Bag could not be removed")
		return
	}
}
