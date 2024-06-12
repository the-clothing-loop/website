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

# .PHONY: frontend-start
# frontend-start:
# 	docker compose -f docker-compose.dev.yml exec frontend sh -c 'npm i; npm run start:lan'

# .PHONY: app-start
# app-start:
# 	docker compose -f docker-compose.dev.yml exec app sh -c 'npm i; npm run dev:docker'

# .PHONY: server-start
# server-start:
# 	docker compose -f docker-compose.dev.yml exec server sh -c 'go run cmd/server/main.go -c config.dev.yml'

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
