#!/bin/sh
set -eu

# Coolify calls this script from the repository root inside its build helper.
# Explicit invocations prevent BuildKit from compiling services concurrently.
for service in server frontend app; do
  docker compose --env-file /artifacts/build-time.env \
    -f docker-compose.recovery.yml build "$service"
done
