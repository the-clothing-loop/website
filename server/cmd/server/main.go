package main

import (
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	server "github.com/the-clothing-loop/website/server/internal"
	"github.com/the-clothing-loop/website/server/internal/app"
)

func main() {
	app.ConfigInit(".")
	if app.Config.JWT_SECRET == "" {
		panic(fmt.Errorf("no jwt secret in config file: %v", app.Config))
	}

	if app.Config.ENV == app.EnvEnumProduction || app.Config.ENV == app.EnvEnumAcceptance {
		flag.Set("log_dir", "/var/log/clothingloop-api/")
		flag.Set("alsologtostderr", "true")
		slog.SetLogLoggerLevel(slog.LevelWarn)
	} else {
		flag.Set("log_dir", "./")
		flag.Set("logtostderr", "true")
		slog.SetLogLoggerLevel(slog.LevelDebug)
	}
	flag.Parse()

	fmt.Printf("Setup environment in: %s\n", app.Config.ENV)
	fmt.Printf("Listening to: %s:%d\n", app.Config.HOST, app.Config.PORT)
	fmt.Printf("Calling database at: %s:%d\n", app.Config.DB_HOST, app.Config.DB_PORT)
	router := server.Routes()

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", app.Config.HOST, app.Config.PORT), router)
	if server.Scheduler != nil {
		server.Scheduler.Stop()
	}
	if err != http.ErrServerClosed {
		slog.Error("error listen and serve", "err", err)
		os.Exit(1)
	}
}
