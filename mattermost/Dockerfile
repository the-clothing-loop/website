FROM caddy:alpine
WORKDIR /srv/
COPY Caddyfile /etc/caddy/

ENTRYPOINT caddy run --config=/etc/caddy/Caddyfile
