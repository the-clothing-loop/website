package main

import (
	"fmt"
	"net/http"

	server "github.com/CollActionteam/clothing-loop/server/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
)

func main() {
	app.ConfigInit()

	fmt.Printf("Setup environment in: %s\n", app.Config.ENV)
	fmt.Printf("Listening to: %s:%d\n", app.Config.HOST, app.Config.PORT)
	fmt.Printf("Calling database at: %s:%d\n", app.Config.DB_HOST, app.Config.DB_PORT)
	router := server.Routes()

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", app.Config.HOST, app.Config.PORT), router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
