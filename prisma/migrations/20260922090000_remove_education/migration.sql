-- Education and certificates are removed from the platform entirely.
--
-- This drops the table and its rows, and the enum that only it used. There is
-- no backfill and no way back through a migration: take a dump first if the
-- content is still wanted.
DROP TABLE "Education";

DROP TYPE "EducationType";
