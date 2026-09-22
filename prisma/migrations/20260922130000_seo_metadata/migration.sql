-- The tab and search-result title and description move from the translation
-- files into Settings -> SEO, so they are editable without a deploy.
ALTER TABLE "SiteSetting" ADD COLUMN "metaTitleAr" TEXT;
ALTER TABLE "SiteSetting" ADD COLUMN "metaTitleEn" TEXT;
ALTER TABLE "SiteSetting" ADD COLUMN "metaDescriptionAr" TEXT;
ALTER TABLE "SiteSetting" ADD COLUMN "metaDescriptionEn" TEXT;
