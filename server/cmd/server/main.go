package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/golang/glog"
	server "github.com/the-clothing-loop/website/server/internal"
	"github.com/the-clothing-loop/website/server/internal/app"
)

func main() {
	app.ConfigInit(".")

	if app.Config.ENV == app.EnvEnumProduction || app.Config.ENV == app.EnvEnumAcceptance {
		flag.Set("log_dir", "/var/log/clothingloop-api/")
		flag.Set("alsologtostderr", "true")
	} else {
		flag.Set("log_dir", "./")
		flag.Set("logtostderr", "true")
	}
	flag.Parse()
	defer glog.Flush()

	glog.Infof("Setup environment in: %s\n", app.Config.ENV)
	glog.Infof("Listening to: %s:%d\n", app.Config.HOST, app.Config.PORT)
	glog.Infof("Calling database at: %s:%d\n", app.Config.DB_HOST, app.Config.DB_PORT)
	router := server.Routes()

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", app.Config.HOST, app.Config.PORT), router)
	if server.Scheduler != nil {
		server.Scheduler.Stop()
	}
	if err != http.ErrServerClosed {
		glog.Fatalf("error listen and serve: %s", err)
	}
}
