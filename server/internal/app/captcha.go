package app

import (
	capserver "github.com/ackcoder/go-cap"
)

var CaptchaServer *capserver.Cap

func CaptchaInit() {
	CaptchaServer = capserver.New()
}
