#!/bin/sh

pushd templates

caddy validate --config ./Caddyfile || exit 1
caddy validate --config ./Caddyfile.maint || exit 1
echo ./Caddyfile | caddy fmt --overwrite
echo ./Caddyfile.maint | caddy fmt --overwrite

popd
