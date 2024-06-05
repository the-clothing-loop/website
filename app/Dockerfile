FROM node:20-alpine AS build
WORKDIR /app/
COPY package.json package-lock.json ./
RUN npm ci

ARG ENV

RUN if [ "$ENV" = "production" ] ; then npm run build:production; fi
RUN if [ "$ENV" = "acceptance" ] ; then npm run build:acceptance; fi

FROM caddy:latest
WORKDIR /app/
COPY --from=build /app/ .
COPY Caddyfile /
ENV PORT=80
ENTRYPOINT caddy run --config=/Caddyfile
