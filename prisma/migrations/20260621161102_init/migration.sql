-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('idea', 'active', 'paused', 'blocked', 'completed', 'discarded', 'frozen');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ProjectMaturity" AS ENUM ('idea', 'validation', 'design', 'development', 'testing', 'production', 'maintenance');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('app', 'web', 'ecommerce', 'newsletter', 'infrastructure', 'admin', 'content', 'business', 'other');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('inbox', 'pending', 'in_progress', 'waiting', 'blocked', 'completed', 'discarded');

-- CreateEnum
CREATE TYPE "TaskContext" AS ENUM ('development', 'design', 'research', 'admin', 'commercial', 'content', 'review', 'purchase', 'call', 'other');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('domain', 'hosting', 'database', 'email', 'api', 'repository', 'cloud_service', 'payment_gateway', 'social_media', 'design_file', 'analytics', 'backup', 'server', 'legal_tax', 'other');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('active', 'inactive', 'pending', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('captured', 'evaluating', 'future', 'converted_to_project', 'discarded');

-- CreateEnum
CREATE TYPE "DueItemType" AS ENUM ('domain', 'hosting', 'subscription', 'license', 'api', 'payment', 'backup', 'ssl', 'tax', 'review', 'other');

-- CreateEnum
CREATE TYPE "DueItemStatus" AS ENUM ('pending', 'done', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('none', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('weekly_review', 'monthly_review', 'project_review', 'backup_review', 'financial_review', 'content_review', 'system_review', 'other');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly', 'custom');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'done', 'overdue', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'idea',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "maturity" "ProjectMaturity" NOT NULL DEFAULT 'idea',
    "projectType" "ProjectType" NOT NULL DEFAULT 'other',
    "impactLevel" "Level",
    "effortLevel" "Level",
    "technicalComplexity" "Level",
    "currentEnergy" "Level",
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "nextAction" TEXT,
    "blockedReason" TEXT,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "frozenReason" TEXT,
    "frozenUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "areaId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'inbox',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "estimatedMinutes" INTEGER,
    "energyLevel" "Level",
    "context" "TaskContext",
    "isToday" BOOLEAN NOT NULL DEFAULT false,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT,
    "areaId" TEXT,
    "type" "AssetType" NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "accountEmail" TEXT,
    "username" TEXT,
    "passwordManagerReference" TEXT,
    "notes" TEXT,
    "renewalDate" TIMESTAMP(3),
    "cost" DECIMAL(12,2),
    "currency" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "potential" "Level",
    "complexity" "Level",
    "status" "IdeaStatus" NOT NULL DEFAULT 'captured',
    "reviewDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DueItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "assetId" TEXT,
    "type" "DueItemType" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderDate" TIMESTAMP(3),
    "recurrence" "RecurrenceType" NOT NULL DEFAULT 'none',
    "status" "DueItemStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2),
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "areaId" TEXT,
    "type" "ReviewType" NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "lastReviewDate" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyFocus" (
    "id" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "mainProjectId" TEXT,
    "weeklyGoal" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyFocus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyFocusSecondaryProject" (
    "id" TEXT NOT NULL,
    "weeklyFocusId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "WeeklyFocusSecondaryProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyFocusAvoidProject" (
    "id" TEXT NOT NULL,
    "weeklyFocusId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "WeeklyFocusAvoidProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE INDEX "Project_status_priority_idx" ON "Project"("status", "priority");

-- CreateIndex
CREATE INDEX "Project_areaId_idx" ON "Project"("areaId");

-- CreateIndex
CREATE INDEX "Task_status_dueDate_idx" ON "Task"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "DigitalAsset_renewalDate_status_idx" ON "DigitalAsset"("renewalDate", "status");

-- CreateIndex
CREATE INDEX "DueItem_dueDate_status_idx" ON "DueItem"("dueDate", "status");

-- CreateIndex
CREATE INDEX "Review_nextReviewDate_status_idx" ON "Review"("nextReviewDate", "status");

-- CreateIndex
CREATE INDEX "WeeklyFocus_weekStartDate_weekEndDate_idx" ON "WeeklyFocus"("weekStartDate", "weekEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyFocusSecondaryProject_weeklyFocusId_projectId_key" ON "WeeklyFocusSecondaryProject"("weeklyFocusId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyFocusAvoidProject_weeklyFocusId_projectId_key" ON "WeeklyFocusAvoidProject"("weeklyFocusId", "projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalAsset" ADD CONSTRAINT "DigitalAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalAsset" ADD CONSTRAINT "DigitalAsset_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueItem" ADD CONSTRAINT "DueItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueItem" ADD CONSTRAINT "DueItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "DigitalAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFocus" ADD CONSTRAINT "WeeklyFocus_mainProjectId_fkey" FOREIGN KEY ("mainProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFocusSecondaryProject" ADD CONSTRAINT "WeeklyFocusSecondaryProject_weeklyFocusId_fkey" FOREIGN KEY ("weeklyFocusId") REFERENCES "WeeklyFocus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFocusSecondaryProject" ADD CONSTRAINT "WeeklyFocusSecondaryProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFocusAvoidProject" ADD CONSTRAINT "WeeklyFocusAvoidProject_weeklyFocusId_fkey" FOREIGN KEY ("weeklyFocusId") REFERENCES "WeeklyFocus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFocusAvoidProject" ADD CONSTRAINT "WeeklyFocusAvoidProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
