package httperror

import (
	"fmt"
	"log/slog"

	"github.com/gin-gonic/gin"
)

type HttpError struct {
	Error  error
	Status int
}

func New(status int, errOrMessage any) *HttpError {
	var err error
	if e, ok := errOrMessage.(error); ok {
		err = e
	} else {
		err = fmt.Errorf(errOrMessage.(string))
	}

	return &HttpError{
		Error:  err,
		Status: status,
	}
}

func (e *HttpError) StatusWithError(c *gin.Context) {
	c.Error(e.Error)
	if 100 <= e.Status && e.Status < 300 {
		slog.Info(e.Error.Error())
	} else if 300 <= e.Status && e.Status < 400 {
		slog.Warn(e.Error.Error())
	} else {
		slog.Error(e.Error.Error())
	}
	c.String(e.Status, e.Error.Error())
}
