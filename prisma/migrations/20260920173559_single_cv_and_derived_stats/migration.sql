-- One CV file instead of one per locale.
-- The column is added first and backfilled from whichever locale had a file, so
-- an existing upload survives the change.
ALTER TABLE "SiteSetting" ADD COLUMN "cvUrl" TEXT;

UPDATE "SiteSetting"
SET "cvUrl" = COALESCE("cvUrlAr", "cvUrlEn");

ALTER TABLE "SiteSetting" DROP COLUMN "cvUrlAr";
ALTER TABLE "SiteSetting" DROP COLUMN "cvUrlEn";

-- Years of experience now come from HeroSection.careerStartDate and the project
-- count from the visible projects, so neither is stored any more.
ALTER TABLE "AboutSection" DROP COLUMN "yearsExperience";
ALTER TABLE "AboutSection" DROP COLUMN "projectsCount";
