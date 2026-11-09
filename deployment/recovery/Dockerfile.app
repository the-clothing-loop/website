FROM node:22-alpine AS build
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci
COPY app/ ./
COPY deployment/recovery/prepare-images.mjs /tmp/prepare-images.mjs
RUN node /tmp/prepare-images.mjs src
RUN rm -f .env .env.local .env.production .env.production.local .env.acceptance .env.development
COPY deployment/recovery/app.env .env.production
RUN npm run build:generate-open-source-page && NODE_OPTIONS=--max-old-space-size=1024 npx tsc && NODE_OPTIONS=--max-old-space-size=1024 npx vite build --mode production

FROM caddy:alpine
COPY --from=build /app/build/ /srv/
COPY deployment/recovery/Caddyfile.app /etc/caddy/Caddyfile
