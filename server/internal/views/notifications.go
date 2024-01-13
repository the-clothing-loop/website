package views

import (
	"github.com/OneSignal/onesignal-go-api"
)

// TODO: Remove this and use json files instead
var Notifications map[string]*onesignal.StringMap = map[string]*onesignal.StringMap{
	"newBulkyItemHasBeenCreatedTitle": {
		En: onesignal.PtrString("A new bulky item has been created"),
		// Nl: onesignal.PtrString(),
	},

	"bagYouAreHoldingIsTooOldTitle": {
		En: onesignal.PtrString("The bag you are holding has been in your possession for too long"),
		// Nl: "",
	},

	"bagHasBeenAssignedToYouTitle": {
		En: onesignal.PtrString("A bag has been assigned to you"),
		// Nl: "",
	},
	"significantRouteChangeTitle": {
		En: onesignal.PtrString("There has been a significant change to the route of your loop"),
		// Nl: "",
	},
	// empty string to allow empty notification messages
	"": {},
}
