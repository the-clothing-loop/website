//go:build !ci

package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigInit(t *testing.T) {
	assert.NotPanics(t, func() {
		ConfigTestInit("../..")
	})
	assert.NotEqual(t, 0, Config.DB_PORT, "db_port not set")
	assert.Equal(t, EnvEnumTesting, Config.ENV, "env is not set to testing")
}
