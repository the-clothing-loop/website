package controllers

import (
	"fmt"
	"log/slog"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRandomizeCoord(t *testing.T) {
	// slog.SetLogLoggerLevel(slog.LevelDebug)
	f := func(coord float64, expected string) {
		t.Helper()

		result := randomizeCoord(coord)
		resultStr := fmt.Sprintf("%g", result)
		// slog.Debug("testing coords", "expected", expected, "result str", resultStr)
		assert.GreaterOrEqual(t, len(resultStr), len(expected))
		for i, exp := range expected {
			// slog.Debug("looping in expected runes", "expected rune", exp, "result rune", resultStr[i], "is ?", exp == '?')
			if exp == '?' {
				continue
			}
			if len(resultStr) >= i {
				// slog.Warn("result string too short")
				break
			}
			assert.Equal(t, exp, int32(resultStr[i]))
		}
	}

	f(51.717122, "51.7171??")
	f(51.7171222938888, "51.7171??")
	f(51.717122, "51.7171??")
	f(51.717120, "51.7171??")
	f(51.717020, "51.7170??")
	f(51.710000, "51.7100??")
	f(51.7, "51.7100??")
}

func TestRandomizeCoordIsRandom(t *testing.T) {
	f := func(coord float64, attempts int) []error {
		t.Helper()
		errs := []error{}
		for i := 0; i < attempts; i++ {
			result1 := randomizeCoord(coord)
			result2 := randomizeCoord(coord)
			result1Str := fmt.Sprintf("%.6f", result1)
			result2Str := fmt.Sprintf("%f", result2)
			fmt.Println(result1Str)
			if fmt.Sprintf("%c%c", result1Str[7], result1Str[8]) == fmt.Sprintf("%c%c", result2Str[7], result2Str[8]) {
				errs = append(errs, fmt.Errorf("result is the same on each randomization"))
			}
			if fmt.Sprintf("%c", result1Str[7]) == fmt.Sprintf("%c", result2Str[7]) {
				errs = append(errs, fmt.Errorf("[%d] result decimal %d is the same", i, 7))
			}
			if fmt.Sprintf("%c", result1Str[8]) == fmt.Sprintf("%c", result2Str[8]) {
				errs = append(errs, fmt.Errorf("[%d] result decimal %d is the same", i, 8))
			}
		}
		slog.Info("Randomization", "amount of similar coordinates", len(errs), "errs", errs)
		return errs
	}

	assert.LessOrEqual(t, len(f(51.717122, 10)), 30)
}
