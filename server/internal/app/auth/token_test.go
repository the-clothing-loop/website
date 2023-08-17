package auth_test

import (
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	Faker "github.com/jaswdr/faker"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
)

var faker = Faker.New()

func TestReadFromRequest(t *testing.T) {
	token := faker.UUID().V4()
	c := &gin.Context{
		Request: &http.Request{
			Header: http.Header{},
		},
	}
	c.Request.Header.Set("Authorization", "Bearer "+token)

	result, ok := auth.TokenReadFromRequest(c)
	assert.True(t, ok)
	assert.Equal(t, result, token)
}
