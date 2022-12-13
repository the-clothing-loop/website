#!/bin/sh

pushd templates

caddy validate --config ./Caddyfile && \
caddy validate --config ./Caddyfile.maint
echo ./Caddyfile | caddy fmt --overwrite
echo ./Caddyfile.maint | caddy fmt --overwrite

popd
