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

	f([]string{"f"}, "", false)
	f([]string{"1,2,3"}, "", false)
	f([]string{""}, "", false)
	f([]string{}, "", false)
	f([]string{"1", "15"}, "", false)
	f([]string{"1", "1"}, "", false)
	f([]string{"1"}, "", true)
	f([]string{"2"}, "", true)
	f([]string{"3"}, "", true)
	f([]string{"4"}, "", true)
	f([]string{"5"}, "", true)
	f([]string{"6"}, "", true)
	f([]string{"7"}, "", false)
	f([]string{"8"}, "", true)
	f([]string{"9"}, "", true)
	f([]string{"10"}, "", true)
	f([]string{"11"}, "", true)
	f([]string{"12"}, "", true)
	f([]string{"13"}, "", true)
	f([]string{"14"}, "", true)
	f([]string{"1", "13"}, "", true)

	f([]string{"7"}, "", false)
	f([]string{"7", "3"}, "", false)
	f([]string{"4", "7"}, "", false)
	f([]string{"7"}, "a", false)
	f([]string{"7"}, "aa", false)
	f([]string{"7"}, "aaa", false)
	f([]string{"7"}, "aaaa", false)
	f([]string{"7"}, "aaaaa", true)
	f([]string{"7"}, "aaaaaa", true)
}
