-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('whiteboard', 'flowchart', 'architecture', 'process', 'mindmap', 'notes', 'other');

-- CreateEnum
CREATE TYPE "BoardStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "type" "BoardType" NOT NULL DEFAULT 'whiteboard',
    "data" JSONB NOT NULL,
    "thumbnail" TEXT,
    "status" "BoardStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Board_areaId_projectId_moduleId_idx" ON "Board"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Board_status_updatedAt_idx" ON "Board"("status", "updatedAt");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
