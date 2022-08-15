package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

type mockGinContextResponse struct {
	Response *http.Response
	Body     string
}

func (r mockGinContextResponse) BodyJSON() gin.H {
	body := gin.H{}
	json.Unmarshal([]byte(r.Body), &body)

	return body
}

func mockGinContext(method string, url string, bodyJSON *gin.H, token string) (*gin.Context, func() mockGinContextResponse) {
	body := bytes.NewBuffer([]byte{})
	if bodyJSON != nil {
		json_data, _ := json.Marshal(bodyJSON)
		body = bytes.NewBuffer(json_data)
	}

	r := httptest.NewRequest(method, url, body)
	rr := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rr)
	c.Request = r

	c.Set("DB", db)

	if token != "" {
		c.Request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))
	}

	// ro.ServeHTTP(rr, c.Request)
	resultFunc := func() mockGinContextResponse {
		body := rr.Body.String()
		res := rr.Result()
		return mockGinContextResponse{
			Response: res,
			Body:     body,
		}
	}

	return c, resultFunc
}
