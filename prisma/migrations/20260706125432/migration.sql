/*
  Warnings:

  - The values [draft] on the enum `LibraryItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LibraryItemStatus_new" AS ENUM ('active', 'archived');
ALTER TABLE "public"."LibraryItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LibraryItem" ALTER COLUMN "status" TYPE "LibraryItemStatus_new" USING ("status"::text::"LibraryItemStatus_new");
ALTER TYPE "LibraryItemStatus" RENAME TO "LibraryItemStatus_old";
ALTER TYPE "LibraryItemStatus_new" RENAME TO "LibraryItemStatus";
DROP TYPE "public"."LibraryItemStatus_old";
ALTER TABLE "LibraryItem" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "LibraryItem" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "variables" SET DEFAULT ARRAY[]::TEXT[];
