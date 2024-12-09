package models

import (
	// "log/slog"
	"errors"
	"fmt"
	"time"

	"github.com/samber/lo"
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
	Email                   string
	UserCreatedAt           time.Time `json:"-"`
	UserDeletedAt           time.Time `json:"-"`
	IsMoved                 bool
	IsNotEnoughItemsILiked  bool
	IsAddressTooFar         bool
	IsTooTimeConsuming      bool
	IsDoneSwapping          bool
	IsDidntFitIn            bool
	IsOther                 bool
	IsPlanToJoinNewLoop     bool
	IsPlanToStartNewLoop    bool
	IsDontPlanToParticipate bool
	IsQualityDidntMatch     bool
	IsSizesDidntMatch       bool
	IsStylesDidntMatch      bool
	OtherExplanation        string
}

var ErrReasonInvalid = errors.New("Please select at least one reason")

func ValidateAllReasonsEnum(arr []string, otherExplanation string) bool {
	err := validate.Var(arr, "unique,gt=0,dive,oneof=1 2 3 4 5 6 7 8 9 10 11 12 13")
	if err != nil {
		return false
	}
	if lo.Contains(arr, ReasonEnumOther) {
		if len(otherExplanation) < 5 {
			return false
		}
	}

	return true
}

func (d *DeletedUser) SetReasons(reasons []string) error {
	for _, reason := range reasons {
		switch reason {
		case ReasonEnumMoved:
			d.IsMoved = true
		case ReasonEnumNotEnoughItemsILiked:
			d.IsNotEnoughItemsILiked = true
		case ReasonEnumAddressTooFar:
			d.IsAddressTooFar = true
		case ReasonEnumTooTimeConsuming:
			d.IsTooTimeConsuming = true
		case ReasonEnumDoneSwapping:
			d.IsDoneSwapping = true
		case ReasonEnumDidntFitIn:
			d.IsDidntFitIn = true
		case ReasonEnumOther:
			d.IsOther = true
		case ReasonEnumPlanToJoinNewLoop:
			d.IsPlanToJoinNewLoop = true
		case ReasonEnumPlanToStartNewLoop:
			d.IsPlanToStartNewLoop = true
		case ReasonEnumDontPlanToParticipate:
			d.IsDontPlanToParticipate = true
		case ReasonEnumQualityDidntMatch:
			d.IsQualityDidntMatch = true
		case ReasonEnumSizesDidntMatch:
			d.IsSizesDidntMatch = true
		case ReasonEnumStylesDidntMatch:
			d.IsStylesDidntMatch = true
		default:
			return fmt.Errorf("Invalid reason: %s", reason)
		}
	}
	return nil
}
