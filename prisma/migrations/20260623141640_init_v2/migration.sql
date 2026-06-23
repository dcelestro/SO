-- CreateEnum
CREATE TYPE "AreaStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('idea', 'analysis', 'active', 'paused', 'blocked', 'frozen', 'completed', 'discarded');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('planned', 'active', 'paused', 'blocked', 'completed', 'discarded');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('app', 'web', 'ecommerce', 'newsletter', 'infrastructure', 'admin', 'content', 'business', 'other');

-- CreateEnum
CREATE TYPE "ProjectMaturity" AS ENUM ('idea', 'validation', 'design', 'development', 'testing', 'production', 'maintenance');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('feature', 'backend', 'frontend', 'database', 'design', 'content', 'infrastructure', 'legal_admin', 'commercial', 'documentation', 'other');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('inbox', 'pending', 'in_progress', 'waiting', 'blocked', 'completed', 'discarded');

-- CreateEnum
CREATE TYPE "TaskContext" AS ENUM ('development', 'design', 'research', 'admin', 'commercial', 'content', 'review', 'purchase', 'call', 'other');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('specification', 'brief', 'design', 'contract', 'note', 'research', 'technical', 'commercial', 'legal', 'other');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('domain', 'hosting', 'database', 'repository', 'api', 'design_file', 'provider', 'tool', 'account', 'cloud_service', 'payment_gateway', 'analytics', 'backup', 'server', 'other');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('active', 'inactive', 'pending', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('active', 'revised', 'discarded');

-- CreateEnum
CREATE TYPE "ImportantDateType" AS ENUM ('deadline', 'milestone', 'launch', 'review', 'renewal', 'payment', 'meeting', 'delivery', 'other');

-- CreateEnum
CREATE TYPE "DateStatus" AS ENUM ('pending', 'done', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('overdue_task', 'missing_next_action', 'upcoming_date', 'blocked_project', 'blocked_module', 'inactive_project', 'inactive_module', 'too_many_active_projects', 'manual', 'other');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('active', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "InboxItemType" AS ENUM ('capture', 'task', 'document', 'credential', 'resource', 'decision', 'important_date', 'alert', 'project', 'module');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('pending', 'processed', 'discarded');

-- CreateEnum
CREATE TYPE "FocusScopeType" AS ENUM ('area', 'project', 'module');

-- CreateEnum
CREATE TYPE "ShortcutType" AS ENUM ('system', 'area', 'project', 'module', 'resource', 'inbox', 'alerts', 'custom');

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
    "status" "AreaStatus" NOT NULL DEFAULT 'active',
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
    "projectType" "ProjectType" NOT NULL DEFAULT 'other',
    "maturity" "ProjectMaturity" NOT NULL DEFAULT 'idea',
    "nextAction" TEXT,
    "blockedReason" TEXT,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "frozenReason" TEXT,
    "frozenUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ModuleStatus" NOT NULL DEFAULT 'planned',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "moduleType" "ModuleType" NOT NULL DEFAULT 'other',
    "nextAction" TEXT,
    "blockedReason" TEXT,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "estimatedMinutes" INTEGER,
    "energyLevel" "Level",
    "context" "TaskContext",
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'other',
    "url" TEXT,
    "filePath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "serviceName" TEXT,
    "url" TEXT,
    "username" TEXT,
    "email" TEXT,
    "passwordManagerReference" TEXT,
    "notes" TEXT,
    "has2FA" BOOLEAN NOT NULL DEFAULT false,
    "recoveryEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
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

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "reason" TEXT,
    "consequences" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'active',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportantDate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "type" "ImportantDateType" NOT NULL DEFAULT 'other',
    "date" TIMESTAMP(3) NOT NULL,
    "reminderDate" TIMESTAMP(3),
    "status" "DateStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportantDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "projectId" TEXT,
    "moduleId" TEXT,
    "type" "AlertType" NOT NULL DEFAULT 'manual',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'medium',
    "status" "AlertStatus" NOT NULL DEFAULT 'active',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "InboxItemType" NOT NULL DEFAULT 'capture',
    "status" "InboxStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyFocus" (
    "id" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "mainScopeType" "FocusScopeType" NOT NULL,
    "mainAreaId" TEXT,
    "mainProjectId" TEXT,
    "mainModuleId" TEXT,
    "secondaryScopes" JSONB NOT NULL DEFAULT '[]',
    "avoidScopes" JSONB NOT NULL DEFAULT '[]',
    "weeklyGoal" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyFocus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "areaId" TEXT,
    "projectId" TEXT,
    "moduleId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesktopShortcut" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ShortcutType" NOT NULL DEFAULT 'custom',
    "icon" TEXT,
    "color" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "lastOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesktopShortcut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE INDEX "Project_areaId_status_idx" ON "Project"("areaId", "status");

-- CreateIndex
CREATE INDEX "ProjectModule_areaId_projectId_status_idx" ON "ProjectModule"("areaId", "projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectModule_projectId_name_key" ON "ProjectModule"("projectId", "name");

-- CreateIndex
CREATE INDEX "Task_areaId_projectId_moduleId_idx" ON "Task"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Task_status_dueDate_idx" ON "Task"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Document_areaId_projectId_moduleId_idx" ON "Document"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Credential_areaId_projectId_moduleId_idx" ON "Credential"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Resource_areaId_projectId_moduleId_idx" ON "Resource"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Decision_areaId_projectId_moduleId_idx" ON "Decision"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "ImportantDate_areaId_projectId_moduleId_idx" ON "ImportantDate"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "ImportantDate_status_date_idx" ON "ImportantDate"("status", "date");

-- CreateIndex
CREATE INDEX "Alert_areaId_projectId_moduleId_idx" ON "Alert"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "Alert_status_severity_idx" ON "Alert"("status", "severity");

-- CreateIndex
CREATE INDEX "WeeklyFocus_weekStartDate_weekEndDate_idx" ON "WeeklyFocus"("weekStartDate", "weekEndDate");

-- CreateIndex
CREATE INDEX "ActivityLog_areaId_projectId_moduleId_idx" ON "ActivityLog"("areaId", "projectId", "moduleId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "DesktopShortcut_sortOrder_isPinned_idx" ON "DesktopShortcut"("sortOrder", "isPinned");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectModule" ADD CONSTRAINT "ProjectModule_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectModule" ADD CONSTRAINT "ProjectModule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantDate" ADD CONSTRAINT "ImportantDate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantDate" ADD CONSTRAINT "ImportantDate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantDate" ADD CONSTRAINT "ImportantDate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
