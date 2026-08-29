#!/bin/sh
set -eu

: "${OTEL_EXPORTER_ENDPOINT:=http://10.10.10.10:30001}"

envsubst '${OTEL_EXPORTER_ENDPOINT}' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf

exec "$@"