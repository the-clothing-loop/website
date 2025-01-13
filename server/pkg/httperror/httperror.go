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
	errStr := e.Error.Error()
	if 100 <= e.Status && e.Status < 300 {
		slog.Info("http error", "status", e.Status, "err", e.Error)
	} else if 300 <= e.Status && e.Status < 400 {
		slog.Warn("http error", "status", e.Status, "err", e.Error)
	} else {
		slog.Error("http error", "status", e.Status, "err", e.Error)
	}
	c.String(e.Status, errStr)
}
