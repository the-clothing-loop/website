package tsp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPreorder(t *testing.T) {
	tree := [][]int{{1}, {1, 2}, {1, 2, 3}, {4}}
	path := []int{1, 2}
	preorder(&tree, &path, 2)
	assert.Equal(t, []int{1, 2}, path)
}

func TestToRadians(t *testing.T) {
	assert.Equal(t, toRadians(90), 25)
}
