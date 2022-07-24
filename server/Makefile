.PHONY: start build-server build-server-fcgi test docker

# List all make commands
default:
	@grep '^[^#[:space:]\.].*:' Makefile

# Start go server
start:
	@go run cmd/server/main.go

build-server:
	@go build -o server cmd/server/main.go

build-server-fcgi:
	@go build -o cmd/server-fcgi/static/app.fcgi cmd/server-fcgi/main.go

# Run all go tests
test:
	@go test ./...

docker:
	@cd docker; docker-compose up