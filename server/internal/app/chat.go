package app

import (
	"context"
	"log/slog"

	"github.com/ascii8/nakama-go"
)

var ChatClient *nakama.Client

func ChatInit() {

	if Config.NAKAMA_SERVER_KEY == "" {
		panic("NAKAMA_SERVER_KEY is required")
	}

	ChatClient = ChatCreateClient()

	ctx := context.TODO()

	err := ChatClient.Healthcheck(ctx)
	if err != nil {
		slog.Error("unable to ping nakama", "err", err)
		panic(err)
	} else {
		slog.Info("ping nakama received")
	}
}

func ChatCreateClient() *nakama.Client {
	c := nakama.New(nakama.WithServerKey(Config.NAKAMA_SERVER_KEY), nakama.WithURL(Config.NAKAMA_URL))
	return c
}
