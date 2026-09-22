# Deploying basilmyq on Coolify

## Uploaded files

The bytes live in Postgres, in `Media.data`. Disk is only a cache in front of
it: `UPLOAD_DIR` (`/app/uploads` in the image) is written on upload and read
first, and the first request for a file that is not there fetches it from the
row and leaves the copy behind. A redeploy empties that directory and the
library heals itself one file at a time.

**There is nothing to configure.** Mounting a persistent volume at
`/app/uploads` is still worth doing — it saves the database read after each
deploy — but nothing breaks without it.

It did not always work this way. Files used to live only on the container's
disk, which a redeploy replaces, while their rows stayed in Postgres. Every
push broke every image on the site and nothing in the logs said so.

### Files from before the change

Anything uploaded before the bytes moved into the database, and already gone
from disk, cannot be recovered — nothing holds it. Re-upload from Settings and
the dashboard, then delete the stale rows in **Media**.

If the old files are still on a disk somewhere, point `UPLOAD_DIR` at it and
run the backfill to copy them into their rows:

```bash
npm run backfill-media
```

It prints what it stored and lists anything it could not find.

### Check it

```bash
curl -s https://<your-domain>/api/health
```

- `"storage":"ok"` — the oldest upload can be served.
- `"storage":"missing-files"` — a row from before the change whose file is
  gone. Re-upload it.
- `"storage":"empty"` — nothing uploaded yet.

## Environment

Set in Coolify → **Environment Variables**:

| Variable              | Notes                                                    |
| --------------------- | -------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string.                              |
| `AUTH_SECRET`         | Session signing key.                                     |
| `ADMIN_EMAIL`         | Dashboard sign-in.                                       |
| `ADMIN_PASSWORD_HASH` | From `npm run hash-password`. Escape every `$` as `\$`.  |
| `SITE_URL`            | `https://<your-domain>`, used for canonical URLs and OG. |
| `UPLOAD_DIR`          | Leave unset; the image already sets `/app/uploads`.      |

`.env*` files are run through dotenv-expand, so an unescaped `$` in the bcrypt
hash silently becomes an empty string and sign-in fails with a confusing
"must be a bcrypt hash". `npm run hash-password` prints it already escaped.

## Build and boot

- The build runs without reaching the database. `next build` must stay that
  way: verify with `DATABASE_URL="" npm run build` before pushing.
- `docker-entrypoint.sh` applies committed migrations with `migrate deploy`,
  retrying while Postgres finishes starting. If it still cannot connect it
  starts the server anyway, so the site serves its own maintenance screen
  rather than the host's "Bad Gateway".
- Migrations that drop a table are irreversible. Take a dump first.

## Backups

A Postgres dump is a complete backup: it carries the content and the uploaded
files together. `/app/uploads` is a cache and does not need backing up.
