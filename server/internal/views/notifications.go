package views

import (
	"github.com/OneSignal/onesignal-go-api"
)

const (
	NotificationEnumTitleNewBulkyCreated = "NOTIFICATION_TITLE_NEW_BULKY_CREATED"
	NotificationEnumTitleBagTooOld       = "NOTIFICATION_TITLE_BAG_TOO_OLD"
	NotificationEnumTitleBagAssignedYou  = "NOTIFICATION_TITLE_BAG_ASSIGNED_YOU"
)

// TODO: Remove this and use json files instead
var Notifications map[string]*onesignal.StringMap = map[string]*onesignal.StringMap{
	NotificationEnumTitleNewBulkyCreated: {
		En: onesignal.PtrString("A new bulky item has been created"),
		// Nl: onesignal.PtrString(),
	},

	NotificationEnumTitleBagTooOld: {
		En: onesignal.PtrString("The bag you are holding has been in your possession for too long"),
		// Nl: "",
	},

	NotificationEnumTitleBagAssignedYou: {
		En: onesignal.PtrString("A bag has been assigned to you"),
		// Nl: "",
	},
}
