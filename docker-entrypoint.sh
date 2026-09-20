#!/bin/sh
set -e

# Migrations run before the server accepts traffic. `migrate deploy` only
# applies committed migrations and never resets data — unlike `db push`, which
# must not touch production.
#
# The database container often starts alongside this one and answers with
# "the database system is starting up" for the first few seconds, so keep
# retrying rather than failing the whole deploy on a cold start.
echo "> Applying database migrations…"

attempt=1
max_attempts=60

until (cd /app/migrate && node node_modules/prisma/build/index.js migrate deploy --config prisma7.config.ts); do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "> Database still unreachable after $max_attempts attempts — giving up." >&2
    exit 1
  fi
  echo "> Database not ready yet (attempt $attempt/$max_attempts); retrying in 2s…"
  attempt=$((attempt + 1))
  sleep 2
done

echo "> Starting basilmyq…"
exec "$@"
