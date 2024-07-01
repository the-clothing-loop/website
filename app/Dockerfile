FROM node:20-alpine AS build
WORKDIR /app/
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG ENV

RUN if [ "$ENV" = "production" ] ; then npm run build:production; fi
RUN if [ "$ENV" = "acceptance" ] ; then npm run build:acceptance; fi

FROM caddy:alpine
WORKDIR /srv/
COPY --from=build /app/build/ .
COPY Caddyfile /etc/caddy/Caddyfile
ENTRYPOINT caddy run --config=/etc/caddy/Caddyfile
