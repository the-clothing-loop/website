package main

import (
	"fmt"
	"net/http/cgi"

	server "github.com/CollActionteam/clothing-loop/server/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
)

func main() {
	app.ConfigInit(".")

	router := server.Routes()

	err := cgi.Serve(router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
