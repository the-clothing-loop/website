package noderoute

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAddKeys(t *testing.T) {
	oKeys := []string{"1", "2", "3", "4", "5", "6"}
	nKeys := []string{"1", "7", "3"}

	nk := New(oKeys)
	nk.AddKeys(nKeys)

	assert.Equal(t, []string{"1", "2", "3", "4", "5", "6", "7"}, nk.Keys)
}

func TestNewNodeRoute(t *testing.T) {
	nk := New([]string{"0", "1", "2"})
	nr := nk.NewNodeRoute([]string{"0", "1", "2"})

	// Verify that the entire route is included
	assert.Equal(t, 0, nr[0].KeyIndex)
	assert.Equal(t, 1, nr[1].KeyIndex)
	assert.Equal(t, 2, nr[2].KeyIndex)

	// Test prev values
	assert.Equal(t, 2, nr[0].Prev.KeyIndex)
	assert.Equal(t, 0, nr[1].Prev.KeyIndex)
	assert.Equal(t, 1, nr[2].Prev.KeyIndex)

	// Test next values
	assert.Equal(t, 1, nr[0].Next.KeyIndex)
	assert.Equal(t, 2, nr[1].Next.KeyIndex)
	assert.Equal(t, 0, nr[2].Next.KeyIndex)

	// Test Pointers
	assert.Equal(t, nr[2], nr[0].Prev)
	assert.Equal(t, nr[0], nr[1].Prev)
	assert.Equal(t, nr[1], nr[2].Prev)

	assert.Equal(t, nr[1], nr[0].Next)
	assert.Equal(t, nr[2], nr[1].Next)
	assert.Equal(t, nr[0], nr[2].Next)
}

func TestNewNodeRouteLen2(t *testing.T) {
	nk := New([]string{"0", "1"})
	nr := nk.NewNodeRoute([]string{"0", "1"})

	assert.Equal(t, 0, nr[0].KeyIndex)
	assert.Equal(t, 1, nr[1].KeyIndex)

	assert.Equal(t, 1, nr[0].Prev.KeyIndex)
	assert.Equal(t, 0, nr[1].Prev.KeyIndex)

	assert.Equal(t, 1, nr[0].Next.KeyIndex)
	assert.Equal(t, 0, nr[1].Next.KeyIndex)
}

func TestIndexCircular(t *testing.T) {
	arr := []string{"a", "b", "c"}
	v := get(arr, 9)
	assert.Equal(t, "a", v)

	v = get(arr, 2)
	assert.Equal(t, "c", v)

	v = get(arr, -1)
	assert.Equal(t, "c", v)
}
