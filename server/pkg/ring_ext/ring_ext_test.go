package ring_ext

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.design/x/go2generics/ring"
)

func TestNewWithValues(t *testing.T) {
	r := NewWithValues([]string{"a", "b", "c"})
	assert.Equal(t, "a", r.Value)
}

func TestSomeNext(t *testing.T) {
	r := NewWithValues([]int{1, 2, 3, 4, 5, 6})
	assert.Equal(t, r.Value, 1)

	tests := []struct {
		Needle, ExpectedIndex int
	}{
		{1, 6},
		{5, 4},
	}

	for _, test := range tests {
		t.Run(fmt.Sprintf("needle %d", test.Needle), func(t *testing.T) {
			i := 0
			p := SomeNext(r, func(v int) bool {
				i++
				return v == test.Needle
			})
			assert.Equal(t, test.Needle, p.Value, "needle returned incorrect")
			assert.Equal(t, test.ExpectedIndex, i, "index returned incorrect")
		})
	}
}

func TestEach(t *testing.T) {
	r := NewWithValues([]int{1, 2, 3})
	i := 1
	assert.Equal(t, 1, r.Value)

	Each(r, func(r *ring.Ring[int]) {
		assert.Equal(t, i, r.Value)
		i++
	})
}

func TestFind(t *testing.T) {
	r := NewWithValues([]string{"1", "2", "3", "4", "5", "6"})

	p := Find(r, "3")
	assert.Equal(t, "3", p.Value)

	p = Find(r, "-1")
	assert.Nil(t, p)
}

func TestSomePrev(t *testing.T) {
	r := NewWithValues([]int{1, 2, 3, 4, 5, 6})
	assert.Equal(t, r.Value, 1)

	tests := []struct {
		Needle, ExpectedIndex int
	}{
		{1, 6},
		{5, 2},
	}

	for _, test := range tests {
		t.Run(fmt.Sprintf("needle %d", test.Needle), func(t *testing.T) {
			i := 0
			p := SomePrev(r, func(v int) bool {
				i++
				return v == test.Needle
			})
			assert.Equal(t, test.Needle, p.Value, "needle returned incorrect")
			assert.Equal(t, test.ExpectedIndex, i, "index returned incorrect")
		})
	}
}

func TestGetSurroundingValues(t *testing.T) {
	f := func(arr []string, me string, distance int, expected []string) {
		t.Helper()

		r := NewWithValues(arr)
		result := GetSurroundingValues(r, me, distance)
		assert.Len(t, result, len(expected))
		for _, v := range expected {
			assert.Contains(t, result, v)
		}
	}

	t.Run("get 1 surrounding values", func(t *testing.T) {
		f([]string{"a", "b", "c", "d"}, "b", 1, []string{"a", "c"})
	})
	t.Run("get 2 surrounding values in a 1 len arr", func(t *testing.T) {
		f([]string{"a"}, "a", 2, []string{})
	})
	t.Run("get 4 surrounding values to test overflow", func(t *testing.T) {
		f([]string{"a", "b", "c", "d"}, "b", 4, []string{"a", "c", "d"})
	})
}
