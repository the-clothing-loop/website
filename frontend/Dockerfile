FROM node:20-alpine AS build
WORKDIR /app/
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG ENV
RUN if [ "$ENV" = "production" ] ; then npm run build:production; fi
RUN if [ "$ENV" = "acceptance" ] ; then npm run build:acceptance; fi

FROM caddy:alpine
COPY Caddyfile-acc Caddyfile-prod /etc/caddy/
ARG ENV
RUN if [ "$ENV" = "production" ] ; then cp /etc/caddy/Caddyfile-prod /etc/caddy/Caddyfile; fi
RUN if [ "$ENV" = "acceptance" ] ; then cp /etc/caddy/Caddyfile-acc /etc/caddy/Caddyfile; fi
COPY --from=build /app/build/ /srv/

ENTRYPOINT caddy run --config /etc/caddy/Caddyfile
