package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateAllReasonsEnum(t *testing.T) {
	f := func(arr []string, other string, expect bool) {
		t.Helper()
		res := ValidateAllReasonsEnum(arr, other)
		assert.Equal(t, expect, res)
	}

	t.Run("test arr", func(t *testing.T) {
		f([]string{"f"}, "", false)
		f([]string{""}, "", false)
		f([]string{}, "", false)
		f([]string{"1", "14"}, "", false)
		f([]string{"1", "1"}, "", false)
		f([]string{"1"}, "", true)
		f([]string{"1", "13"}, "", true)
	})

	t.Run("test other", func(t *testing.T) {
		f([]string{"7"}, "", false)
		f([]string{"7", "3"}, "", false)
		f([]string{"4", "7"}, "", false)
		f([]string{"7"}, "a", false)
		f([]string{"7"}, "aa", false)
		f([]string{"7"}, "aaa", false)
		f([]string{"7"}, "aaaa", false)
		f([]string{"7"}, "aaaaa", true)
		f([]string{"7"}, "aaaaaa", true)
	})
}
