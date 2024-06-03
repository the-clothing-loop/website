FROM node:20-alpine AS build
WORKDIR /app/
COPY package.json package-lock.json ./
RUN npm ci

ARG ENV

RUN if [ "$ENV" = "production" ] ; then npm run build:production; fi
RUN if [ "$ENV" = "acceptance" ] ; then npm run build:acceptance; fi

FROM caddy:alpine
WORKDIR /app/
COPY ./Caddyfile-acc ./Caddyfile-prod /
RUN if [ "$ENV" = "production" ] ; then cp /Caddyfile-prod /Caddyfile; fi
RUN if [ "$ENV" = "acceptance" ] ; then cp /Caddyfile-acc /Caddyfile; fi
COPY --from=build /app/build/ .
ENV MAILPIT_PASS=TUFJTFBJVF9QQVNTV09SRA==
CMD caddy run --config /Caddyfile
