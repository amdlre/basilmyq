-- AlterTable
ALTER TABLE "HeroSection" ADD COLUMN     "careerStartDate" TIMESTAMP(3),
ADD COLUMN     "highlightAr" TEXT,
ADD COLUMN     "highlightEn" TEXT;

-- CreateTable
CREATE TABLE "HeroCard" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroCard_isVisible_order_idx" ON "HeroCard"("isVisible", "order");

-- Seed the career start from the years already entered by hand, so the
-- computed figure matches what the site showed before.
UPDATE "HeroSection" AS h
SET "careerStartDate" = CURRENT_DATE - (a."yearsExperience" * INTERVAL '1 year')
FROM "AboutSection" AS a
WHERE h."careerStartDate" IS NULL AND a."yearsExperience" > 0;
