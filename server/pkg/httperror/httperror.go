package httperror

import (
	"fmt"
)

type HttpError struct {
	error
	Status int
}

func New(status int, message string, a ...any) *HttpError {
	return &HttpError{
		error:  fmt.Errorf(message, a...),
		Status: status,
	}
}
