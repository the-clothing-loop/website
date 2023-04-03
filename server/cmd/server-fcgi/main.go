package main

import (
	"fmt"
	"net/http/cgi"

	server "github.com/the-clothing-loop/website/server/internal"
	"github.com/the-clothing-loop/website/server/internal/app"
)

func main() {
	app.ConfigInit(".")

	router := server.Routes()

	err := cgi.Serve(router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
