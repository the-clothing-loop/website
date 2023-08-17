//go:build !ci

package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigInit(t *testing.T) {
	ConfigTestInit("../..")
	assert.NotEqual(t, 0, Config.DB_PORT, "db_port not set")
}

func TestConfigWithTestingEnv(t *testing.T) {
	ConfigTestInit("../..")
	assert.Equal(t, EnvEnumTesting, Config.ENV, "env is not set to testing")
}
