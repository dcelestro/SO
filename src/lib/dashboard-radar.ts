import { getPrisma } from "@/lib/prisma";

export type DashboardSeverity = "critical" | "high" | "medium" | "low" | "info";
export type DashboardItemKind = "task" | "project" | "asset" | "idea" | "alert";

export type DashboardRadarItem = {
  id: string;
  kind: DashboardItemKind;
  title: string;
  subtitle: string;
  description?: string | null;
  date?: string | null;
  severity: DashboardSeverity;
  score: number;
  href: string;
  cta: string;
  meta?: string;
};

export type DashboardKpi = {
  label: string;
  value: number | string;
  detail: string;
  severity: DashboardSeverity;
  href: string;
};

export type DashboardRisk = {
  label: "Bajo" | "Medio" | "Alto" | "Crítico";
  severity: DashboardSeverity;
  summary: string;
  score: number;
};

export type DashboardLastProgress = {
  projectName: string;
  projectHref: string;
  action: string;
  description: string;
  when: string;
  nextStep: string;
  nextHref: string;
} | null;

export type DashboardRadar = {
  generatedAt: string;
  heroIssue: DashboardRadarItem | null;
  risk: DashboardRisk;
  kpis: DashboardKpi[];
  priorityItems: DashboardRadarItem[];
  todayItems: DashboardRadarItem[];
  waitingItems: DashboardRadarItem[];
  upcomingSignals: DashboardRadarItem[];
  calendarItems: DashboardRadarItem[];
  lastProgress: DashboardLastProgress;
};

const DAY = 86_400_000;
const priorityWeight: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
const severityWeight: Record<DashboardSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysFromToday(value: Date | string | null | undefined, today = new Date()) {
  if (!value) return 999;
  const base = startOfDay(today).getTime();
  const target = startOfDay(new Date(value)).getTime();
  return Math.round((target - base) / DAY);
}

function iso(value: Date | string | null | undefined) {
  return value ? new Date(value).toISOString() : null;
}

function severityFromPriority(priority?: string | null): DashboardSeverity {
  if (priority === "critical" || priority === "high" || priority === "medium" || priority === "low") return priority;
  return "medium";
}

function severityFromDate(daysUntil: number, fallback: DashboardSeverity = "medium") {
  if (daysUntil < 0) return "critical";
  if (daysUntil === 0) return "critical";
  if (daysUntil <= 3) return "high";
  if (daysUntil <= 14) return fallback === "low" ? "medium" : fallback;
  return fallback;
}

function dateMeta(date: Date | string | null | undefined, today = new Date()) {
  if (!date) return undefined;
  const d = daysFromToday(date, today);
  if (d < 0) return `Vencido hace ${Math.abs(d)} día${Math.abs(d) === 1 ? "" : "s"}`;
  if (d === 0) return "Vence hoy";
  if (d === 1) return "Vence mañana";
  return `En ${d} días`;
}

function byScoreThenDate(a: DashboardRadarItem, b: DashboardRadarItem) {
  const score = b.score - a.score;
  if (score !== 0) return score;
  return daysFromToday(a.date) - daysFromToday(b.date);
}

export async function getDashboardRadar(): Promise<DashboardRadar> {
  const db = getPrisma();
  const now = new Date();

  const [tasks, projects, assets, ideas, alerts, lastActivity] = await Promise.all([
    db.task.findMany({
      where: { status: { notIn: ["completed", "discarded"] } },
      include: { project: { select: { id: true, name: true, status: true, priority: true, nextAction: true } } },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    }),
    db.project.findMany({
      where: { status: { in: ["active", "blocked", "frozen"] } },
      include: { area: { select: { name: true } } },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    }),
    db.digitalAsset.findMany({
      where: { status: { in: ["active", "pending", "expired"] } },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ renewalDate: "asc" }, { updatedAt: "desc" }],
    }),
    db.idea.findMany({
      where: { status: "inbox" },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ reviewDate: "asc" }, { updatedAt: "desc" }],
    }),
    db.alert.findMany({
      where: { status: "active" },
      include: { project: { select: { id: true, name: true } }, area: { select: { name: true } } },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    }),
    db.activityLog.findFirst({
      include: { project: { select: { id: true, name: true, nextAction: true } }, area: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const taskItems: DashboardRadarItem[] = tasks.map((task) => {
    const d = daysFromToday(task.dueDate, now);
    const baseSeverity = severityFromPriority(task.priority);
    const severity = task.status === "blocked" ? "critical" : task.status === "waiting" ? "high" : severityFromDate(d, task.isCritical ? "critical" : baseSeverity);
    const score =
      severityWeight[severity] * 25 +
      (priorityWeight[task.priority] ?? 0) * 8 +
      (task.isCritical ? 18 : 0) +
      (task.status === "blocked" ? 20 : 0) +
      (task.status === "waiting" ? 12 : 0) +
      (d < 0 ? 18 : d === 0 ? 15 : d <= 3 ? 8 : 0);

    return {
      id: `task-${task.id}`,
      kind: "task",
      title: task.title,
      subtitle: task.project?.name || "Inbox",
      description: task.description,
      date: iso(task.dueDate),
      severity,
      score,
      href: "/tasks",
      cta: "Ver tarea",
      meta: task.status === "blocked" ? "Bloqueada" : task.status === "waiting" ? "En espera" : dateMeta(task.dueDate, now),
    } satisfies DashboardRadarItem;
  });

  const projectItems: DashboardRadarItem[] = projects.map((project) => {
    const d = daysFromToday(project.targetDate, now);
    const baseSeverity = project.status === "blocked" ? "critical" : project.status === "frozen" ? "high" : severityFromPriority(project.priority);
    const missingNextAction = project.status === "active" && !project.nextAction;
    const severity = missingNextAction ? "high" : severityFromDate(d, baseSeverity);
    const score =
      severityWeight[severity] * 25 +
      (priorityWeight[project.priority] ?? 0) * 8 +
      (project.status === "blocked" ? 25 : 0) +
      (project.status === "frozen" ? 16 : 0) +
      (missingNextAction ? 18 : 0) +
      (d < 0 ? 12 : d === 0 ? 10 : 0);

    return {
      id: `project-${project.id}`,
      kind: "project",
      title: project.name,
      subtitle: project.area?.name || "Proyecto",
      description: project.blockedReason || project.nextAction || project.description,
      date: iso(project.targetDate),
      severity,
      score,
      href: `/projects/${project.id}`,
      cta: "Abrir proyecto",
      meta: project.status === "blocked" ? "Bloqueado" : project.status === "frozen" ? "Congelado" : missingNextAction ? "Sin próxima acción" : dateMeta(project.targetDate, now),
    } satisfies DashboardRadarItem;
  });

  const assetItems: DashboardRadarItem[] = assets
    .filter((asset) => asset.status === "expired" || (asset.renewalDate && daysFromToday(asset.renewalDate, now) <= 45))
    .map((asset) => {
      const d = daysFromToday(asset.renewalDate, now);
      const severity = asset.status === "expired" ? "critical" : severityFromDate(d, "medium");
      return {
        id: `asset-${asset.id}`,
        kind: "asset",
        title: asset.name,
        subtitle: asset.project?.name || asset.provider || "Activo digital",
        description: asset.notes,
        date: iso(asset.renewalDate),
        severity,
        score: severityWeight[severity] * 25 + (asset.status === "expired" ? 20 : 0) + (d <= 7 ? 8 : 0),
        href: "/assets",
        cta: "Abrir activo",
        meta: asset.status === "expired" ? "Expirado" : `Renovación · ${dateMeta(asset.renewalDate, now) || "sin fecha"}`,
      } satisfies DashboardRadarItem;
    });

  const ideaItems: DashboardRadarItem[] = ideas
    .filter((idea) => idea.reviewDate && daysFromToday(idea.reviewDate, now) <= 45)
    .map((idea) => {
      const d = daysFromToday(idea.reviewDate, now);
      const potential = severityFromPriority(idea.potential);
      const severity = severityFromDate(d, potential === "critical" ? "high" : potential);
      return {
        id: `idea-${idea.id}`,
        kind: "idea",
        title: idea.title,
        subtitle: idea.project?.name || idea.destination || "Idea en revisión",
        description: idea.description,
        date: iso(idea.reviewDate),
        severity,
        score: severityWeight[severity] * 18 + (d <= 0 ? 12 : 0),
        href: "/ideas",
        cta: "Revisar idea",
        meta: `Revisión · ${dateMeta(idea.reviewDate, now) || "sin fecha"}`,
      } satisfies DashboardRadarItem;
    });

  const alertItems: DashboardRadarItem[] = alerts.map((alert) => {
    const severity = severityFromPriority(alert.severity);
    return {
      id: `alert-${alert.id}`,
      kind: "alert",
      title: alert.title,
      subtitle: alert.project?.name || alert.area?.name || alert.source || "Alerta activa",
      description: alert.description,
      date: iso(alert.createdAt),
      severity,
      score: severityWeight[severity] * 26 + (alert.severity === "critical" ? 12 : 0),
      href: "/alerts",
      cta: "Ver alerta",
      meta: "Alerta activa",
    } satisfies DashboardRadarItem;
  });

  const priorityItems = [...taskItems, ...projectItems, ...assetItems, ...ideaItems, ...alertItems]
    .filter((item) => item.severity === "critical" || item.severity === "high")
    .sort(byScoreThenDate);

  const todayItems = [...taskItems, ...projectItems, ...assetItems, ...ideaItems]
    .filter((item) => item.date && daysFromToday(item.date, now) === 0)
    .sort(byScoreThenDate);

  const waitingItems = [...taskItems, ...projectItems]
    .filter((item) => item.meta === "Bloqueada" || item.meta === "Bloqueado" || item.meta === "En espera" || item.meta === "Congelado" || item.meta === "Sin próxima acción")
    .sort(byScoreThenDate);

  const upcomingSignals = [...taskItems, ...projectItems, ...assetItems, ...ideaItems]
    .filter((item) => item.date)
    .filter((item) => daysFromToday(item.date, now) >= 0 && daysFromToday(item.date, now) <= 45)
    .sort((a, b) => daysFromToday(a.date, now) - daysFromToday(b.date, now) || byScoreThenDate(a, b));

  const calendarItems = [...taskItems, ...projectItems, ...assetItems, ...ideaItems]
    .filter((item) => item.date)
    .sort((a, b) => daysFromToday(a.date, now) - daysFromToday(b.date, now));

  const overdueTasks = taskItems.filter((item) => item.kind === "task" && item.date && daysFromToday(item.date, now) < 0).length;
  const blockedCount = waitingItems.filter((item) => item.meta === "Bloqueada" || item.meta === "Bloqueado").length;
  const highAlertCount = alertItems.filter((item) => item.severity === "critical" || item.severity === "high").length;
  const missingNextActionCount = projectItems.filter((item) => item.meta === "Sin próxima acción").length;
  const riskScore = overdueTasks * 18 + blockedCount * 20 + highAlertCount * 16 + missingNextActionCount * 10 + priorityItems.filter((item) => item.severity === "critical").length * 18;
  const risk: DashboardRisk =
    riskScore >= 90
      ? { label: "Crítico", severity: "critical", score: riskScore, summary: "Hay señales que pueden frenar trabajo importante." }
      : riskScore >= 50
        ? { label: "Alto", severity: "high", score: riskScore, summary: "Hay varios puntos que conviene atender hoy." }
        : riskScore >= 20
          ? { label: "Medio", severity: "medium", score: riskScore, summary: "Hay atención requerida, pero sin saturación." }
          : { label: "Bajo", severity: "low", score: riskScore, summary: "No hay fricción operativa relevante." };

  const lastProgress: DashboardLastProgress = lastActivity
    ? {
        projectName: lastActivity.project?.name || lastActivity.area?.name || lastActivity.entityType,
        projectHref: lastActivity.projectId ? `/projects/${lastActivity.projectId}` : "/dashboard",
        action: lastActivity.action.replaceAll("_", " "),
        description: lastActivity.description || `Movimiento registrado en ${lastActivity.entityType}`,
        when: lastActivity.createdAt.toISOString(),
        nextStep: lastActivity.project?.nextAction || "Retomar el último frente abierto y definir el próximo paso concreto.",
        nextHref: lastActivity.projectId ? `/projects/${lastActivity.projectId}` : "/tasks",
      }
    : null;

  return {
    generatedAt: now.toISOString(),
    heroIssue: priorityItems[0] || null,
    risk,
    kpis: [
      {
        label: "Tareas abiertas",
        value: tasks.length,
        detail: `${overdueTasks} vencida${overdueTasks === 1 ? "" : "s"}`,
        severity: overdueTasks ? "high" : "info",
        href: "/tasks",
      },
      {
        label: "Bloqueos",
        value: blockedCount,
        detail: blockedCount ? "detienen avance" : "sin bloqueos",
        severity: blockedCount ? "critical" : "low",
        href: "/projects",
      },
      {
        label: "Alertas altas",
        value: highAlertCount,
        detail: `${alerts.length} activas en total`,
        severity: highAlertCount ? "high" : "low",
        href: "/alerts",
      },
      {
        label: "Proyectos activos",
        value: projects.filter((project) => project.status === "active").length,
        detail: `${missingNextActionCount} sin próxima acción`,
        severity: missingNextActionCount ? "medium" : "info",
        href: "/projects",
      },
      {
        label: "Riesgo operativo",
        value: risk.label,
        detail: risk.summary,
        severity: risk.severity,
        href: "/alerts",
      },
    ],
    priorityItems: priorityItems.slice(0, 10),
    todayItems: todayItems.slice(0, 8),
    waitingItems: waitingItems.slice(0, 8),
    upcomingSignals: upcomingSignals.slice(0, 8),
    calendarItems,
    lastProgress,
  };
}
