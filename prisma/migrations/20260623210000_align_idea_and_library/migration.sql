-- Align Idea with current Prisma schema
ALTER TABLE "Idea" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
DROP TYPE "IdeaStatus";
CREATE TYPE "IdeaStatus" AS ENUM ('inbox', 'archived', 'promoted');
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE "IdeaStatus" USING (
  CASE
    WHEN "status" IN ('inbox', 'archived', 'promoted') THEN "status"::"IdeaStatus"
    WHEN "status" = 'converted_to_project' THEN 'promoted'::"IdeaStatus"
    WHEN "status" = 'discarded' THEN 'archived'::"IdeaStatus"
    ELSE 'inbox'::"IdeaStatus"
  END
);
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'inbox';

CREATE TYPE "IdeaOrigin" AS ENUM ('saas', 'thirdparty', 'personal');
ALTER TABLE "Idea" ADD COLUMN "origin" "IdeaOrigin" NOT NULL DEFAULT 'personal';
ALTER TABLE "Idea" ADD COLUMN "destination" TEXT;

-- Create Library V1 enums and table
CREATE TYPE "LibraryItemType" AS ENUM ('prompt', 'document_template', 'client_message', 'checklist', 'dev_issue', 'functional_spec', 'technical_spec', 'report', 'email', 'other');
CREATE TYPE "LibraryItemStatus" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "LibraryItemCategory" AS ENUM ('desarrollo', 'documentacion', 'clientes', 'comercial', 'testing', 'operacion', 'prompts', 'otros');

CREATE TABLE "LibraryItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "LibraryItemType" NOT NULL,
  "category" "LibraryItemCategory" NOT NULL,
  "tags" TEXT[] NOT NULL,
  "content" TEXT NOT NULL,
  "variables" TEXT[] NOT NULL,
  "status" "LibraryItemStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LibraryItem_status_updatedAt_idx" ON "LibraryItem"("status", "updatedAt");
CREATE INDEX "LibraryItem_type_category_idx" ON "LibraryItem"("type", "category");
