package main

import (
	"fmt"
	"net/http"

	server "github.com/CollActionteam/clothing-loop/server/local"
	"github.com/CollActionteam/clothing-loop/server/local/global"
)

func main() {
	global.ConfigInit("config.yml")

	router := server.Routes()

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", global.Config.Host, global.Config.Port), router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
