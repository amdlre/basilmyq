-- Uploaded files move into the database.
--
-- They used to live only on the container's disk, which a redeploy replaces,
-- so every image on the site broke whenever anything was pushed. Postgres is
-- a separate service with its own volume, so the bytes now survive on their
-- own without anything to configure on the host.
--
-- Nullable: existing rows keep working, and the disk copy still answers for
-- them until they are re-uploaded or backfilled.
ALTER TABLE "Media" ADD COLUMN "data" BYTEA;
