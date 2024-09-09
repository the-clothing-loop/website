default:
	@grep '^[^#[:space:].].*:' Makefile

.PHONY: docker-start
docker-start:
	docker compose -f docker-compose.dev.yml up -d

.PHONY: docker-stop
docker-stop:
	docker compose -f docker-compose.dev.yml stop

.PHONY: docker-remove
docker-remove:
	docker compose -f docker-compose.dev.yml down

.PHONY: frontend-restart
frontend-restart:
	docker compose -f docker-compose.dev.yml restart frontend

.PHONY: app-restart
app-restart:
	docker compose -f docker-compose.dev.yml restart app

.PHONY: server-restart
server-restart:
	docker compose -f docker-compose.dev.yml restart server

caddy-rebuild:
	docker compose -f docker-compose.dev.yml up -d caddy --build

.PHONY: test
test:
	cd ./server && make test
	cd ./app && npm run test
	cd ./frontend && npm run lint:test

.PHONY: db-setup
db-setup:
	docker compose -f docker-compose.dev.yml exec db sh -c 'mariadb -u root -pfb4aeaa6d860dbabe785675e --database clothingloop < /scripts/dev-purge.sql'
	docker compose -f docker-compose.dev.yml exec server sh -c 'go run cmd/generate-fake-data/main.go 200'
	docker compose -f docker-compose.dev.yml exec db sh -c 'mariadb -u root -pfb4aeaa6d860dbabe785675e --database clothingloop < /scripts/dev-setup-users.sql'

test-prepush:
	cd server && make lint-test test-ci
	cd frontend && npm run lint:test
	cd app && npm run test && npm run lint:test
