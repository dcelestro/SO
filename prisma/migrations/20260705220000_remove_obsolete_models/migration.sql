DROP TABLE IF EXISTS "DueItem" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Decision" CASCADE;
DROP TABLE IF EXISTS "ImportantDate" CASCADE;
DROP TABLE IF EXISTS "DesktopShortcut" CASCADE;

DROP TYPE IF EXISTS "DueItemType" CASCADE;
DROP TYPE IF EXISTS "DueItemStatus" CASCADE;
DROP TYPE IF EXISTS "RecurrenceType" CASCADE;
DROP TYPE IF EXISTS "ReviewType" CASCADE;
DROP TYPE IF EXISTS "Frequency" CASCADE;
DROP TYPE IF EXISTS "ReviewStatus" CASCADE;
DROP TYPE IF EXISTS "DecisionStatus" CASCADE;
DROP TYPE IF EXISTS "ImportantDateType" CASCADE;
DROP TYPE IF EXISTS "DateStatus" CASCADE;
DROP TYPE IF EXISTS "ShortcutType" CASCADE;

DO $$ BEGIN
  CREATE TYPE "LibraryItemType" AS ENUM ('prompt', 'document_template', 'client_message', 'checklist', 'dev_issue', 'functional_spec', 'technical_spec', 'report', 'email', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LibraryItemCategory" AS ENUM ('desarrollo', 'documentacion', 'clientes', 'comercial', 'testing', 'operacion', 'prompts', 'otros');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LibraryItemStatus" AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LibraryItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "LibraryItemType" NOT NULL,
  "category" "LibraryItemCategory" NOT NULL,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "content" TEXT NOT NULL,
  "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "LibraryItemStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LibraryItem_type_category_status_idx" ON "LibraryItem"("type", "category", "status");
CREATE INDEX IF NOT EXISTS "LibraryItem_updatedAt_idx" ON "LibraryItem"("updatedAt");
