package local

import (
	"strconv"
	"time"
)

func FromUnixStrToTime(s string) (*time.Time, error) {
	ts, err := strconv.Atoi(s)
	if err != nil {
		return nil, err
	}

	t := time.Unix(0, int64(ts)*int64(time.Millisecond)).In(time.UTC)
	return &t, nil
}
