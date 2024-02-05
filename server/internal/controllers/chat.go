package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
)

func GetChainChatGroup(c *gin.Context) {
	db := getDB(c)

	var query struct {
		ChainUID string `form:"chain_uid" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, query.ChainUID)
	if !ok {
		return
	}

	chatData := struct {
		ChatID       sql.NullInt64
		ChatPassword sql.NullString
	}{}
	db.Raw(`SELECT chat_id, chat_password FROM chain WHERE id = ? LIMIT 1`, chain.ID).Scan(&chatData)

	// If no room credentials are found
	if !chatData.ChatID.Valid || !chatData.ChatPassword.Valid {

		// Create a new room
		fetch(http.MethodPost, path.Join(app.Config.TINODE_URL, ""))

	}
}

func fetch(method, url string, jsonData *gin.H) (err error, status int, respJson *gin.H) {
	// JSON body
	b, _ := json.Marshal(jsonData)
	requestBody := strings.NewReader(string(b))
	// URI and HTTP method
	request, _ := http.NewRequest(method, url, requestBody)
	request.Header.Set("Content-Type", "application/json")
	// Send request
	resp, _ := http.DefaultClient.Do(request)
	respBodyBytes, _ := io.ReadAll(resp.Body)
	respBodyStr := string(respBodyBytes)

	// Check assertions
	if !(200 <= resp.StatusCode && resp.StatusCode > 300) {
		err := fmt.Errorf("Response code is %v", respBodyStr)
		return err, resp.StatusCode, nil
	}
	respJson = &gin.H{}
	if err := json.Unmarshal(respBodyBytes, respJson); err != nil {
		return err, resp.StatusCode, nil
	}

	return nil, resp.StatusCode, respJson
}
