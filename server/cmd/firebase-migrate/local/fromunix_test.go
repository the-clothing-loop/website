package local

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUnixToTimeShouldReturnCorrectly(t *testing.T) {
	// https://currentmillis.com/?1666004705970

	str := "1666004705970"
	ti, err := FromUnixStrToTime(str)
	if err != nil {
		assert.Fail(t, "%+v", err)
	}

	expected, _ := time.Parse(time.RFC3339, "2022-10-17T11:05:05.970Z")
	assert.Equal(t, expected, *ti)
}

// func TestUnixToTimeShouldReturnEmpty(t *testing.T) {
// 	str := ""
// 	FromUnixStrToTime(str)
// }
