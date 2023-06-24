package app

import (
	"context"

	"github.com/OneSignal/onesignal-go-api"
)

var OneSignalClient *onesignal.APIClient

func OneSignalGetAuth() context.Context {
	return context.WithValue(context.Background(), onesignal.AppAuth, Config.ONESIGNAL_REST_API_KEY)
}

func OneSignalInit() {
	configuration := onesignal.NewConfiguration()
	OneSignalClient = onesignal.NewAPIClient(configuration)
}
