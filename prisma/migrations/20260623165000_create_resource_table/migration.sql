-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ResourceType" AS ENUM ('domain', 'hosting', 'database', 'repository', 'api', 'design_file', 'provider', 'tool', 'account', 'cloud_service', 'payment_gateway', 'analytics', 'backup', 'server', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ResourceStatus" AS ENUM ('active', 'inactive', 'pending', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Resource" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "areaId" TEXT NOT NULL,
  "projectId" TEXT,
  "moduleId" TEXT,
  "type" "ResourceType" NOT NULL DEFAULT 'other',
  "provider" TEXT,
  "url" TEXT,
  "notes" TEXT,
  "renewalDate" TIMESTAMP(3),
  "status" "ResourceStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Resource_areaId_projectId_moduleId_idx" ON "Resource"("areaId", "projectId", "moduleId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Resource" ADD CONSTRAINT "Resource_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Resource" ADD CONSTRAINT "Resource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Resource" ADD CONSTRAINT "Resource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
