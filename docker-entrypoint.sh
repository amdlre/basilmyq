#!/bin/sh
set -e

# Migrations run before the server accepts traffic. `migrate deploy` only
# applies committed migrations and never resets data — unlike `db push`, which
# must not touch production.
echo "> Applying database migrations…"
(cd /app/migrate && node node_modules/prisma/build/index.js migrate deploy --config prisma7.config.ts)

echo "> Starting basilmyq…"
exec "$@"
