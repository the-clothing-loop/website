package main

import (
	"fmt"
	"net/http/cgi"

	server "github.com/CollActionteam/clothing-loop/local"
)

func main() {
	config := server.ConfigInit()

	router := server.Routes(config)

	err := cgi.Serve(router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
