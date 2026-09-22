# Deploying basilmyq on Coolify

## The one thing that must be configured: persistent storage

Uploaded images live on disk at `UPLOAD_DIR` (`/app/uploads` in the image), not
in the database and not in `public/`. The database rows that point at them live
in Postgres, which is its own service with its own volume.

That split is why a redeploy can break every image on the site while nothing
appears to be wrong: **the rows survive, the files do not.** `/uploads/<id>.png`
then answers 404 and the page renders a broken image.

The `VOLUME` line in the `Dockerfile` does not prevent this. Without an
explicit mount Docker creates a _new anonymous volume_ for each container, so
files uploaded after a deploy work until the next one replaces the container —
which is exactly the "it breaks whenever I push" symptom.

### Configure it once

In the Coolify application → **Storages** → **Add**:

| Field            | Value          |
| ---------------- | -------------- |
| Name             | `uploads`      |
| Destination Path | `/app/uploads` |

Redeploy. From then on the directory is the same one on every container.

### Check it

```bash
curl -s https://<your-domain>/api/health
```

- `{"status":"ok","database":"up","storage":"ok"}` — the files the database
  points at are on disk.
- `"storage":"missing-files"` — rows exist whose files are gone. The volume is
  missing or was replaced.
- `"storage":"empty"` — nothing has been uploaded yet, so there is nothing to
  tell yet. Upload one image, redeploy, and check again.

### Files already lost

They are gone: nothing in the database holds the bytes. Re-upload them from
Settings and the dashboard, then delete the orphaned rows in **Media**.

Old anonymous volumes may still be on the host holding those files. To look:

```bash
docker volume ls -qf dangling=true
```

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

Postgres holds the content; `/app/uploads` holds the files. Both are needed to
restore, and a database dump alone will leave every image broken.
