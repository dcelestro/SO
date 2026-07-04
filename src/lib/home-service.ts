import "server-only";

import { getPrisma } from "@/lib/prisma";
import type {
  HomeActivityItem,
  HomeAttentionItem,
  HomeBlockedItem,
  HomeColdProject,
  HomeData,
  HomePath,
  HomeSeverity,
} from "@/lib/home-types";

const DAY = 86_400_000;
const COLD_DAYS = 14;
const STALE_PROGRESS_DAYS = 7;
const DUE_SOON_DAYS = 3;
const RECENT_DAYS = 7;
const openStatuses = ["inbox", "pending", "in_progress", "waiting", "blocked"] as const;
const relevantActions = [
  "task.created",
  "task.completed",
  "resource.created",
  "resource.archived",
  "board.created",
  "board.updated",
  "project.created",
  "module.created",
] as const;

function daysBetween(now: Date, date: Date) {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY));
}

function path(area?: { name: string } | null, project?: { name: string } | null, module?: { name: string } | null): HomePath {
  return { area: area?.name ?? "Inbox", project: project?.name, module: module?.name };
}

function contextHref(item: { areaId?: string | null; projectId?: string | null; moduleId?: string | null }) {
  if (item.moduleId) return `/explorer?type=module&id=${item.moduleId}`;
  if (item.projectId) return `/explorer?type=project&id=${item.projectId}`;
  if (item.areaId) return `/explorer?type=area&id=${item.areaId}`;
  return "/explorer";
}

function taskReason(task: {
  priority: string;
  status: string;
  dueDate: Date | null;
  updatedAt: Date;
}, now: Date): { reason: string; severity: HomeSeverity; score: number } | null {
  const dueDays = task.dueDate ? Math.ceil((task.dueDate.getTime() - now.getTime()) / DAY) : null;
  if (dueDays !== null && dueDays < 0) return { reason: `Vencida hace ${Math.abs(dueDays)} día${Math.abs(dueDays) === 1 ? "" : "s"}`, severity: "critical", score: 100 };
  if (task.status === "blocked") return { reason: "Bloqueada", severity: "critical", score: 95 };
  if (task.priority === "critical") return { reason: "Prioridad crítica", severity: "critical", score: 90 };
  if (task.status === "waiting") return { reason: "En espera", severity: "high", score: 82 };
  if (task.priority === "high") return { reason: "Prioridad alta", severity: "high", score: 72 };
  if (task.status === "in_progress" && daysBetween(now, task.updatedAt) >= STALE_PROGRESS_DAYS) return { reason: `En progreso sin cambios hace ${daysBetween(now, task.updatedAt)} días`, severity: "warning", score: 64 };
  if (dueDays !== null && dueDays <= DUE_SOON_DAYS) return { reason: dueDays === 0 ? "Vence hoy" : `Vence en ${dueDays} día${dueDays === 1 ? "" : "s"}`, severity: "warning", score: 60 };
  return null;
}

function activityHref(log: { entityType: string; entityId: string; areaId: string | null; projectId: string | null; moduleId: string | null }) {
  if (log.entityType === "Board") return `/boards/${log.entityId}`;
  if (log.entityType === "Project") return `/explorer?type=project&id=${log.entityId}`;
  if (log.entityType === "ProjectModule" || log.entityType === "Module") return `/explorer?type=module&id=${log.entityId}`;
  if (log.moduleId) return `/explorer?type=module&id=${log.moduleId}`;
  if (log.projectId) return `/explorer?type=project&id=${log.projectId}`;
  return log.areaId ? `/explorer?type=area&id=${log.areaId}` : "/explorer";
}

const actionLabels: Record<string, string> = {
  "task.created": "Tarea creada",
  "task.completed": "Tarea completada",
  "resource.created": "Recurso creado",
  "resource.archived": "Recurso archivado",
  "board.created": "Pizarra creada",
  "board.updated": "Pizarra actualizada",
  "project.created": "Proyecto creado",
  "module.created": "Módulo creado",
};

export async function getHomeData(now = new Date()): Promise<HomeData> {
  const db = getPrisma();
  const recentSince = new Date(now.getTime() - RECENT_DAYS * DAY);
  const [tasks, projects, modules, resources, boards, activityLogs, importantOpenTasksCount, blockedOrWaitingTasksCount, recentEventsCount] = await Promise.all([
    db.task.findMany({
      where: { status: { not: "discarded" } },
      select: {
        id: true, title: true, status: true, priority: true, dueDate: true, updatedAt: true,
        areaId: true, projectId: true, moduleId: true,
        area: { select: { name: true } }, project: { select: { name: true } }, module: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    }),
    db.project.findMany({
      where: { status: { in: ["active", "blocked"] }, isFrozen: false },
      select: { id: true, name: true, areaId: true, status: true, priority: true, updatedAt: true, area: { select: { name: true } } },
      take: 250,
    }),
    db.projectModule.findMany({
      where: { status: { in: ["active", "blocked"] } },
      select: { id: true, name: true, areaId: true, projectId: true, status: true, priority: true, updatedAt: true, area: { select: { name: true } }, project: { select: { name: true } } },
      take: 500,
    }),
    db.resource.findMany({
      where: { status: { not: "cancelled" } },
      select: { id: true, name: true, status: true, renewalDate: true, updatedAt: true, areaId: true, projectId: true, moduleId: true, area: { select: { name: true } }, project: { select: { name: true } }, module: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    }),
    db.board.findMany({
      where: { status: { not: "archived" } },
      select: { id: true, title: true, updatedAt: true, areaId: true, projectId: true, moduleId: true, area: { select: { name: true } }, project: { select: { name: true } }, module: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    }),
    db.activityLog.findMany({
      where: { action: { in: [...relevantActions] }, createdAt: { gte: recentSince } },
      select: {
        id: true, entityType: true, entityId: true, action: true, description: true, createdAt: true,
        areaId: true, projectId: true, moduleId: true,
        area: { select: { name: true } }, project: { select: { name: true } }, module: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    db.task.count({ where: { status: { in: [...openStatuses] }, priority: { in: ["critical", "high"] } } }),
    db.task.count({ where: { status: { in: ["blocked", "waiting"] } } }),
    db.activityLog.count({ where: { action: { in: [...relevantActions] }, createdAt: { gte: recentSince } } }),
  ]);

  const openTasks = tasks.filter((task) => openStatuses.includes(task.status as (typeof openStatuses)[number]));
  const openByProject = new Map<string, number>();
  for (const task of openTasks) if (task.projectId) openByProject.set(task.projectId, (openByProject.get(task.projectId) ?? 0) + 1);

  const allColdProjects: HomeColdProject[] = projects
    .filter((project) => project.status === "active")
    .map((project) => {
      const relatedTasks = tasks.filter((item) => item.projectId === project.id);
      const relatedResources = resources.filter((item) => item.projectId === project.id);
      const relatedBoards = boards.filter((item) => item.projectId === project.id);
      const candidates = [
        { date: project.updatedAt, type: "Proyecto" as const },
        ...relatedTasks.map((item) => ({ date: item.updatedAt, type: "Tarea" as const })),
        ...relatedResources.map((item) => ({ date: item.updatedAt, type: "Recurso" as const })),
        ...relatedBoards.map((item) => ({ date: item.updatedAt, type: "Pizarra" as const })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime());
      const hasContent = relatedTasks.length + relatedResources.length + relatedBoards.length > 0;
      return hasContent ? {
        id: project.id,
        name: project.name,
        path: path(project.area, { name: project.name }),
        href: `/explorer?type=project&id=${project.id}`,
        lastActivityAt: candidates[0].date.toISOString(),
        daysInactive: daysBetween(now, candidates[0].date),
        openTaskCount: openByProject.get(project.id) ?? 0,
        lastChangeType: candidates[0].type,
      } : null;
    })
    .filter((project): project is HomeColdProject => Boolean(project && project.daysInactive >= COLD_DAYS))
    .sort((a, b) => b.daysInactive - a.daysInactive);
  const coldProjects = allColdProjects.slice(0, 5);

  const attentionCandidates: Array<HomeAttentionItem & { score: number }> = [];
  for (const task of openTasks) {
    const signal = taskReason(task, now);
    if (!signal) continue;
    attentionCandidates.push({
      id: task.id, kind: "task", title: task.title, reason: signal.reason, severity: signal.severity,
      priority: task.priority, status: task.status, path: path(task.area, task.project, task.module),
      href: contextHref(task), updatedAt: task.updatedAt.toISOString(), score: signal.score,
    });
  }
  for (const project of projects.filter((item) => item.status === "blocked")) attentionCandidates.push({
    id: project.id, kind: "project", title: project.name, reason: "Proyecto bloqueado", severity: "critical",
    priority: project.priority, status: project.status, path: path(project.area, { name: project.name }),
    href: `/explorer?type=project&id=${project.id}`, updatedAt: project.updatedAt.toISOString(), score: 94,
  });
  for (const projectModule of modules.filter((item) => item.status === "blocked")) attentionCandidates.push({
    id: projectModule.id, kind: "module", title: projectModule.name, reason: "Módulo bloqueado", severity: "critical",
    priority: projectModule.priority, status: projectModule.status, path: path(projectModule.area, projectModule.project, { name: projectModule.name }),
    href: `/explorer?type=module&id=${projectModule.id}`, updatedAt: projectModule.updatedAt.toISOString(), score: 93,
  });
  for (const project of projects.filter((item) => item.status === "active" && (openByProject.get(item.id) ?? 0) >= 5)) attentionCandidates.push({
    id: project.id, kind: "project", title: project.name, reason: `${openByProject.get(project.id)} tareas abiertas`, severity: "warning",
    priority: project.priority, status: project.status, path: path(project.area, { name: project.name }),
    href: `/explorer?type=project&id=${project.id}`, updatedAt: project.updatedAt.toISOString(), score: 55,
  });
  for (const project of coldProjects) attentionCandidates.push({
    id: project.id, kind: "project", title: project.name, reason: `Proyecto frío · ${project.daysInactive} días sin actividad`, severity: "warning",
    status: "active", path: project.path, href: project.href, updatedAt: project.lastActivityAt, score: 45,
  });
  for (const resource of resources.filter((item) => item.status === "expired" || (item.renewalDate && item.renewalDate < now))) attentionCandidates.push({
    id: resource.id, kind: "resource", title: resource.name, reason: resource.status === "expired" ? "Recurso vencido" : "Renovación vencida", severity: "critical",
    status: resource.status, path: path(resource.area, resource.project, resource.module), href: contextHref(resource), updatedAt: resource.updatedAt.toISOString(), score: 88,
  });

  const attentionItems = attentionCandidates
    .sort((a, b) => b.score - a.score || new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    .filter((item, index, all) => all.findIndex((candidate) => candidate.kind === item.kind && candidate.id === item.id) === index)
    .slice(0, 6)
    .map(({ score, ...item }) => { void score; return item; });

  const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 };
  const blockedItems: HomeBlockedItem[] = openTasks
    .filter((task): task is typeof task & { status: "blocked" | "waiting" } => task.status === "blocked" || task.status === "waiting")
    .sort((a, b) => Number(b.status === "blocked") - Number(a.status === "blocked") || priorityScore[b.priority] - priorityScore[a.priority] || a.updatedAt.getTime() - b.updatedAt.getTime())
    .slice(0, 6)
    .map((task) => ({ id: task.id, title: task.title, status: task.status, priority: task.priority, path: path(task.area, task.project, task.module), href: contextHref(task), updatedAt: task.updatedAt.toISOString() }));

  const recentActivity: HomeActivityItem[] = activityLogs.slice(0, 8).map((log) => ({
    id: log.id,
    entityType: log.entityType,
    title: log.description || log.entityType,
    action: actionLabels[log.action] ?? log.action,
    path: { area: log.area?.name ?? "Nexo", project: log.project?.name, module: log.module?.name },
    href: activityHref(log),
    createdAt: log.createdAt.toISOString(),
  }));

  return {
    generatedAt: now.toISOString(),
    pulse: {
      importantOpenTasks: importantOpenTasksCount,
      blockedOrWaitingTasks: blockedOrWaitingTasksCount,
      coldProjects: allColdProjects.length,
      recentEvents: recentEventsCount,
    },
    attentionItems,
    blockedItems,
    coldProjects,
    recentActivity,
  };
}
