package app

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigInit(t *testing.T) {
	ConfigTestInit("../..")
	assert.NotEqual(t, 0, Config.DB_PORT, "db_port not set")
}
func TestConfigWithProductionEnv(t *testing.T) {
	os.Setenv("SERVER_ENV", EnvEnumProduction)
	ConfigInit("../..")
	assert.Equal(t, EnvEnumProduction, Config.ENV, "env is not set to production")
}
func TestConfigWithTestingEnv(t *testing.T) {
	ConfigTestInit("../..")
	assert.Equal(t, EnvEnumTesting, Config.ENV, "env is not set to testing")
}
