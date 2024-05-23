package views

import (
	"github.com/OneSignal/onesignal-go-api"
)

// TODO: Remove this and use json files instead
var Notifications map[string]*onesignal.StringMap = map[string]*onesignal.StringMap{
	"newBulkyItemHasBeenCreatedTitle": {
		En: onesignal.PtrString("A new bulky item has been created"),
		Nl: onesignal.PtrString("Er is een nieuw groot voorwerp aangemaakt"),
	},
	"bagYouAreHoldingIsTooOldTitle": {
		En: onesignal.PtrString("The bag you are holding has been in your possession for too long"),
		Nl: onesignal.PtrString("De tas die u vasthoudt, is te lang in uw bezit geweest"),
	},
	"bagHasBeenAssignedToYouTitle": {
		En: onesignal.PtrString("A bag has been assigned to you"),
		Nl: onesignal.PtrString("Er is u een tas toegewezen"),
	},
	"newChatNotification": {
		En: onesignal.PtrString("You have a message in chat"),
		Nl: onesignal.PtrString("Je hebt een bericht in de chat"),
	},
}
