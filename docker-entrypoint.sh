#!/bin/sh
set -e

# Migrations run before the server accepts traffic. `migrate deploy` only
# applies committed migrations and never resets data — unlike `db push`, which
# must not touch production.
echo "> Applying database migrations…"
./node_modules/.bin/prisma migrate deploy

echo "> Starting basilmyq…"
exec "$@"
