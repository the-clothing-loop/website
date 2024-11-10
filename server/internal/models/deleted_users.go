package models

import (
	// "log/slog"
	"fmt"
	"time"
)

const (
	ReasonEnumMoved                 = "1"
	ReasonEnumNotEnoughItemsILiked  = "2"
	ReasonEnumAddressTooFar         = "3"
	ReasonEnumTooTimeConsuming      = "4"
	ReasonEnumDoneSwapping          = "5"
	ReasonEnumDidntFitIn            = "6"
	ReasonEnumOther                 = "7"
	ReasonEnumPlanToJoinNewLoop     = "8"
	ReasonEnumPlanToStartNewLoop    = "9"
	ReasonEnumDontPlanToParticipate = "10"
	ReasonEnumQualityDidntMatch     = "11"
	ReasonEnumSizesDidntMatch       = "12"
	ReasonEnumStylesDidntMatch      = "13"
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
		case ReasonEnumMoved:
			d.Moved = true
		case ReasonEnumNotEnoughItemsILiked:
			d.NotEnoughItemsILiked = true
		case ReasonEnumAddressTooFar:
			d.AddressTooFar = true
		case ReasonEnumTooTimeConsuming:
			d.TooTimeConsuming = true
		case ReasonEnumDoneSwapping:
			d.DoneSwapping = true
		case ReasonEnumDidntFitIn:
			d.DidntFitIn = true
		case ReasonEnumOther:
			d.Other = true
		case ReasonEnumPlanToJoinNewLoop:
			d.PlanToJoinNewLoop = true
		case ReasonEnumPlanToStartNewLoop:
			d.PlanToStartNewLoop = true
		case ReasonEnumDontPlanToParticipate:
			d.DontPlanToParticipate = true
		case ReasonEnumQualityDidntMatch:
			d.QualityDidntMatch = true
		case ReasonEnumSizesDidntMatch:
			d.SizesDidntMatch = true
		case ReasonEnumStylesDidntMatch:
			d.StylesDidntMatch = true
		default:
			return fmt.Errorf("Invalid reason: %s", reason)
		}
	}
	return nil
}
