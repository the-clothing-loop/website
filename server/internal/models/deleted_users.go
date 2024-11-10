package models

import (
	// "log/slog"
	"fmt"
	"time"
)

type DeletedUser struct {
	Email                 string
	CreatedAt             time.Time `json:"-"`
	DeletedAt             time.Time `json:"-"`
	Moved                 bool
	NotEnoughItemsILiked  bool
	AddressTooFar         bool
	TooTimeConsuming      bool
	DoneSwapping          bool
	DidntFitIn            bool
	Other                 bool
	PlanToJoinNewLoop     bool
	PlanToStartNewLoop    bool
	DontPlanToParticipate bool
	QualityDidntMatch     bool
	SizesDidntMatch       bool
	StylesDidntMatch      bool
}

func (d *DeletedUser) SetReasons(reasons []string) error {
	for _, reason := range reasons {
		fmt.Println("Received reason:", reason)

		switch reason {
		case "1":
			d.Moved = true
		case "2":
			d.NotEnoughItemsILiked = true
		case "3":
			d.AddressTooFar = true
		case "4":
			d.TooTimeConsuming = true
		case "5":
			d.DoneSwapping = true
		case "6":
			d.DidntFitIn = true
		case "7":
			d.Other = true
		case "8":
			d.PlanToJoinNewLoop = true
		case "9":
			d.PlanToStartNewLoop = true
		case "10":
			d.DontPlanToParticipate = true
		case "11":
			d.QualityDidntMatch = true
		case "12":
			d.SizesDidntMatch = true
		case "13":
			d.StylesDidntMatch = true
		default:
			return fmt.Errorf("Invalid reason: %s", reason)
		}
	}
	return nil
}
