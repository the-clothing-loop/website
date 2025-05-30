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

.PHONY: test-force
test-force:
	@go clean -testcache; go test ./...

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

.PHONY: coords-migrate
coords-migrate:
	@SERVER_ENV=production go run cmd/get-user-coords-and-country/main.go -mb-token="" 2>&1 | tee -a coords.log

.PHONY: typex2
typex2:
	@go tool typex2 -l typescript -i ./sharedtypes -o ../frontend/src/api/typex2.ts
	@go tool typex2 -l typescript -i ./sharedtypes -o ../../app-v4/api/typex2.ts

gen-typex: typex2
