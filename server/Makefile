.PHONY: start build-server build-server-fcgi test docker-start docker-stop

# List all make commands
default:
	@grep '^[^#[:space:]\.].*:' Makefile

# Start go server
start:
	@CGO_ENABLED=0 go run cmd/server/main.go

build-server:
	@CGO_ENABLED=0 go build -o server cmd/server/main.go

lint-test:
	@gofmt -d .
	@staticcheck ./...
lint:
	@gofmt -w .
	@staticcheck ./...

# Run all go tests
test:
	@go test ./...

coverage:
	go test -cover ./...

generate-fake-data:
	go run cmd/generate-fake-data/main.go

generate-fake-data-500:
	go run cmd/generate-fake-data/main.go 500

tunnel-db-vps1:
	ssh -L 127.0.0.1:3307:127.0.0.1:3306 vps1.clothingloop.org

stripe-dev:
	stripe listen --forward-to localhost:8084/v2/payment/webhook

docker-start:
	@cd docker; docker compose up -d
docker-stop:
	@cd docker; docker compose down

coords-migrate:
	@SERVER_ENV=production go run cmd/get-user-coords-and-country/main.go -mb-token="" -start=1001 -end=2000 2>&1 | tee -a coords.log
