.PHONY: start build-server build-server-fcgi test docker

start:
	@go run cmd/server/main.go
build-server:
	@go build -o server cmd/server/main.go
build-server-fcgi:
	@go build -o cmd/server-fcgi/static/app.fcgi cmd/server-fcgi/main.go
test:
	@go test ./...
docker:
	@cd docker; docker-compose up