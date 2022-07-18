package main

import (
	"fmt"
	"net/http/cgi"

	server "github.com/CollActionteam/clothing-loop/local"
	"github.com/CollActionteam/clothing-loop/local/global"
)

func main() {
	global.ConfigInit("config.yml")

	router := server.Routes()

	err := cgi.Serve(router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
