default:
	@grep '^[^#[:space:].].*:' Makefile

.PHONY: docker-start
docker-start:
	docker compose up -d

.PHONY: docker-stop
docker-stop:
	docker compose stop

.PHONY: docker-remove
docker-remove:
	docker compose down

.PHONY: frontend-start
frontend-start:
	docker compose exec frontend sh -c 'npm i; npm run start:lan'

.PHONY: app-start
app-start:
	docker compose exec app sh -c 'npm i; npm run dev:docker'

.PHONY: server-start
server-start:
	docker compose exec server sh -c 'go run cmd/server/main.go'

.PHONY: db-setup
db-setup:
	docker compose exec server sh -c 'go run cmd/generate-fake-data/main.go 200'
	docker compose exec db sh -c 'mariadb -u root -pfb4aeaa6d860dbabe785675e --database clothingloop < /scripts/dev-setup-users.sql'
