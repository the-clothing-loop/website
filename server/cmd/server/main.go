package main

import (
	"fmt"
	"net/http"

	server "github.com/CollActionteam/clothing-loop/local"
)

func main() {
	config := server.ConfigInit()

	router := server.Routes(config)

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", config.Host, config.Port), router)
	if err != nil {
		panic(fmt.Errorf("error listen and serve: %s", err))
	}
}
