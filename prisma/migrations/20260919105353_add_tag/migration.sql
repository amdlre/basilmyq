-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_order_idx" ON "Tag"("order");

-- Seed the list from the tags already used, so nothing has to be retyped.
INSERT INTO "Tag" ("id", "name", "order", "updatedAt")
SELECT gen_random_uuid()::text, "name", (ROW_NUMBER() OVER (ORDER BY "name"))::int - 1, CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT btrim(unnest("tags")) AS "name" FROM "Project"
  UNION
  SELECT DISTINCT btrim(unnest("tags")) AS "name" FROM "Post"
) AS "used"
WHERE "name" <> '';
