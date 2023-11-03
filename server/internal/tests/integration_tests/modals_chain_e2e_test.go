//go:build !ci

package integration_tests

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestChainModel(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})
	chain1, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{})

	t.Run("ChainGetNamesByIDs", func(t *testing.T) {
		chainIds := []uint{chain.ID, chain1.ID}

		chainNames, err := models.ChainGetNamesByIDs(db, chainIds)
		fmt.Println(chainIds, chainNames)
		assert.Equal(t, chain.Name, chainNames[0])
		assert.Equal(t, chain1.Name, chainNames[1])
		assert.Nil(t, err)
	})
}
