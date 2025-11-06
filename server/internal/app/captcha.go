package app

import (
	capserver "github.com/samwafgo/cap_go_server"
)

var CaptchaServer *capserver.Cap

func CaptchaInit() {
	config := &capserver.CapConfig{
		NoFSState: true,
	}
	CaptchaServer = capserver.New(config)
}
