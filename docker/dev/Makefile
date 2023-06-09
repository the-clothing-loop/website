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

docker-plausible-start:
	docker compose -f docker-compose.plausible.yml up -d
docker-plausible-stop:
	docker compose -f docker-compose.plausible.yml stop
docker-plausible-remove:
	docker compose -f docker-compose.plausible.yml down