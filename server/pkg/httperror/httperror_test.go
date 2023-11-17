package httperror

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewHttpErrorf(t *testing.T) {
	err := New(http.StatusConflict, "hi")
	assert.Equal(t, err.Error(), "hi")
	assert.Equal(t, err.Status, http.StatusConflict)
}
