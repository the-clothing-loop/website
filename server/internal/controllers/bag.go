package controllers

import (
	"fmt"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/samber/lo"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
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
ORDER BY bags.id ASC
	`, "`", "`", "`", "`"), chain.ID).Scan(&bags).Error
	if err != nil {
		slog.Error("Unable to find bags", "err", err)
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

	ok, authUser, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
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

	// if authUser is not host user can only set the bag holder
	_, isChainAdmin := authUser.IsPartOfChain(chain.UID)
	if !isChainAdmin {
		isAllowed := bag.ID != 0 && body.Number == nil && body.Color == nil
		if !isAllowed {
			c.AbortWithError(401, fmt.Errorf("As participant you are not allowed to change the bag colour or name"))
			return
		}
	}

	holder := struct {
		UserChainID uint
		Email       string
	}{}
	db.Raw(`
SELECT uc.id AS user_chain_id, u.email AS email FROM user_chains AS uc
LEFT JOIN users AS u ON u.id = uc.user_id
WHERE u.uid = ? AND uc.chain_id = ?
LIMIT 1
	`, body.HolderUID, chain.ID).Scan(&holder)
	if holder.UserChainID == 0 {
		c.String(http.StatusExpectationFailed, "Bag holder does not exist")
		return
	}

	// set default values
	if body.Number != nil {
		bag.Number = *(body.Number)
	}
	if body.Color != nil {
		bag.Color = *(body.Color)
	}
	if body.UpdatedAt != nil {
		bag.UpdatedAt = *(body.UpdatedAt)
	} else if bag.ID == 0 {
		bag.UpdatedAt = time.Now()
	}
	bag.LastNotifiedAt = nil
	bag.AddLastUserEmailToUpdateFifo(holder.Email)

	bag.UserChainID = holder.UserChainID

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
		slog.Error("Unable to create or update bag", "err", err)
		c.String(http.StatusInternalServerError, "Unable to create or update bag")
		return
	}

	if body.UserUID != body.HolderUID {
		err := app.OneSignalCreateNotification(db, []string{body.HolderUID},
			*views.Notifications[views.NotificationEnumTitleBagAssignedYou],
			app.OneSignalEllipsisContent(bag.Number))
		if err != nil {
			slog.Error("Notification creation failed", "err", err)
		}
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

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
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
		slog.Error("Bag could not be removed", "err", err)
		c.String(http.StatusInternalServerError, "Bag could not be removed")
		return
	}
}

type BagsHistoryResponseBag struct {
	ID      uint                            `json:"id"`
	Number  string                          `json:"number"`
	Color   string                          `json:"color"`
	History []BagsHistoryResponseBagHistory `json:"history"`
}
type BagsHistoryResponseBagHistory struct {
	Name  string    `json:"name"`
	Email string    `json:"-"`
	Date  string    `json:"date,omitempty"`
	_Date time.Time `json:"-"`
}

func BagsHistory(c *gin.Context) {
	db := getDB(c)
	var query struct {
		ChainUID string `form:"chain_uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, query.ChainUID)
	if !ok {
		return
	}

	// Get bags of current chain
	bags := []models.Bag{}
	err := db.Raw(`
SELECT id, number, color, last_user_email_to_update, last_user_date_to_update
FROM bags
WHERE user_chain_id IN (
	SELECT id FROM user_chains WHERE chain_id = ?
)
	`, chain.ID).Scan(&bags).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	chainUsers, err := chain.GetUserContactData(db)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	res := []*BagsHistoryResponseBag{}
	for _, bag := range bags {
		resBag := &BagsHistoryResponseBag{
			ID:     bag.ID,
			Number: bag.Number,
			Color:  bag.Color,
		}
		lastUserEmailToUpdate := strings.Split(bag.LastUserEmailToUpdate, ",")
		lastUserDateToUpdate := strings.Split(bag.LastUserDateToUpdate, ",")
		for i, email := range lastUserEmailToUpdate {
			date, _ := lo.Nth(lastUserDateToUpdate, i)
			_date, _ := time.Parse(time.RFC3339, date)

			user, found := lo.Find(chainUsers, func(u models.UserContactData) bool {
				if !u.Email.Valid {
					return false
				}
				return u.Email.String == email
			})
			if found {
				resBag.History = append(resBag.History, BagsHistoryResponseBagHistory{
					Name:  user.Name,
					Email: email,
					Date:  date,
					_Date: _date,
				})
			} else {
				resBag.History = append(resBag.History, BagsHistoryResponseBagHistory{
					Name:  "***",
					Email: email,
					Date:  date,
					_Date: _date,
				})
			}
			sort.Slice(resBag.History, func(a, b int) bool {
				return resBag.History[a]._Date.Before(resBag.History[b]._Date)
			})
		}
		res = append(res, resBag)
	}

	c.JSON(http.StatusOK, res)
}
