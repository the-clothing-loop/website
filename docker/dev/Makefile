docker-start:
	docker compose up -d
docker-stop:
	docker compose stop
docker-remove:
	docker compose down
frontend-start:
	docker compose exec frontend sh -c 'npm i; npm run start:lan'
app-start:
	docker compose exec app sh -c 'npm i; npm run dev'
server-start:
	docker compose exec server sh -c 'go run cmd/server/main.go'
db-setup:
	docker compose exec server sh -c 'go run cmd/generate-fake-data/main.go 200'
	docker compose exec db sh -c 'mariadb -u root -pfb4aeaa6d860dbabe785675e --database clothingloop < /scripts/dev-setup-users.sql'
