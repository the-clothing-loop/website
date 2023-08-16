# List all make commands
default:
	@grep '^[^#[:space:].].*:' Makefile

# Start go server
.PHONY: start
start:
	@CGO_ENABLED=0 go run cmd/server/main.go

.PHONY: build-server
build-server:
	@CGO_ENABLED=0 go build -o server cmd/server/main.go

.PHONY: lint-test
lint-test:
	@gofmt -d .
	@staticcheck ./...

.PHONY: lint
lint:
	@gofmt -w .
	@staticcheck ./...

# Run all go tests
.PHONY: test
test:
	@go test ./...

.PHONY: test-ci
test-ci:
	@go test -tags ci ./...

.PHONY: coverage
coverage:
	go test -cover ./...

.PHONY: generate-fake-data
generate-fake-data:
	go run cmd/generate-fake-data/main.go

.PHONY: generate-fake-data-500
generate-fake-data-500:
	go run cmd/generate-fake-data/main.go 500

.PHONY: tunnel-db-vps1
tunnel-db-vps1:
	ssh -L 127.0.0.1:3307:127.0.0.1:3306 vps1.clothingloop.org

.PHONY: stripe-dev
stripe-dev:
	stripe listen --forward-to localhost:8084/v2/payment/webhook

.PHONY: docker-start
docker-start:
	@cd docker; docker compose up -d

.PHONY: stop
docker-stop:
	@cd docker; docker compose down

.PHONY: coords-migrate
coords-migrate:
	@SERVER_ENV=production go run cmd/get-user-coords-and-country/main.go -mb-token="" -start=1001 -end=2000 2>&1 | tee -a coords.log
