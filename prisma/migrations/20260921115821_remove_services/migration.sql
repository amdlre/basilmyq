-- Services are removed from the platform entirely.
--
-- This drops the table and its rows. There is no backfill and no way back
-- through a migration: take a dump first if the content is still wanted.
DROP TABLE "Service";

-- The public-section switch for it goes with the section.
ALTER TABLE "SiteSetting" DROP COLUMN "showServices";
