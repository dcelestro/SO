import { AlertsView } from "@/components/alerts/alerts-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const day = 24 * 60 * 60 * 1000;

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function daysFromNow(value: Date | string | null | undefined) {
  if (!value) return 0;
  return Math.ceil((new Date(value).getTime() - Date.now()) / day);
}

function dueText(value: Date | string | null | undefined) {
  const diff = daysFromNow(value);
  if (diff < 0) return `Vencido hace ${Math.abs(diff)} día${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Vence hoy";
  return `En ${diff} día${diff === 1 ? "" : "s"}`;
}

export default async function AlertsPage() {
  const prisma = getPrisma();
  const now = new Date();
  const soon7 = new Date(now.getTime() + 7 * day);
  const soon14 = new Date(now.getTime() + 14 * day);
  const soon30 = new Date(now.getTime() + 30 * day);

  const [manualAlerts, tasks, projects, assets, ideas, areas, projectOptions] = await Promise.all([
    prisma.alert.findMany({
      include: { area: true, project: true, module: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        status: { notIn: ["completed", "discarded"] },
        dueDate: { not: null, lte: soon7 },
      },
      include: { project: true, area: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.project.findMany({
      where: {
        status: { notIn: ["completed", "discarded"] },
        OR: [
          { status: { in: ["active", "blocked", "frozen"] } },
          { isFrozen: true },
          { targetDate: { not: null, lte: soon14 } },
        ],
      },
      include: { area: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.digitalAsset.findMany({
      where: {
        status: { in: ["active", "pending"] },
        renewalDate: { not: null, lte: soon30 },
      },
      include: { project: true, area: true },
      orderBy: { renewalDate: "asc" },
    }),
    prisma.idea.findMany({
      where: {
        status: "inbox",
        reviewDate: { not: null, lte: soon14 },
      },
      include: { project: true, area: true },
      orderBy: { reviewDate: "asc" },
    }),
    prisma.area.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { status: { notIn: ["discarded"] } },
      orderBy: { name: "asc" },
    }),
  ]);

  const taskSignals = tasks.map((task) => {
    const diff = daysFromNow(task.dueDate);
    return {
      id: `task-${task.id}`,
      sourceId: task.id,
      generated: true,
      type: "overdue_task",
      severity: diff < 0 ? "critical" : task.priority === "critical" ? "high" : "medium",
      title: task.title,
      description: `${dueText(task.dueDate)} · ${task.project?.name || "Inbox"}`,
      context: "Tarea",
      date: iso(task.dueDate),
      href: "/tasks",
      status: "active",
    };
  });

  const projectSignals = projects.flatMap((project) => {
    const items: any[] = [];
    if (project.status === "active" && !project.nextAction?.trim()) {
      items.push({
        id: `project-next-${project.id}`,
        sourceId: project.id,
        generated: true,
        type: "missing_next_action",
        severity: project.priority === "critical" ? "high" : "medium",
        title: project.name,
        description: "Proyecto activo sin próxima acción definida.",
        context: "Proyecto",
        date: iso(project.updatedAt),
        href: `/projects/${project.id}`,
        status: "active",
      });
    }
    if (project.status === "blocked" || project.blockedReason) {
      items.push({
        id: `project-blocked-${project.id}`,
        sourceId: project.id,
        generated: true,
        type: "blocked_project",
        severity: "high",
        title: project.name,
        description: project.blockedReason || "Proyecto bloqueado.",
        context: "Proyecto",
        date: iso(project.updatedAt),
        href: `/projects/${project.id}`,
        status: "active",
      });
    }
    if (project.isFrozen || project.status === "frozen") {
      items.push({
        id: `project-frozen-${project.id}`,
        sourceId: project.id,
        generated: true,
        type: "inactive_project",
        severity: daysFromNow(project.frozenUntil) <= 0 ? "medium" : "low",
        title: project.name,
        description: project.frozenUntil ? `Proyecto congelado · ${dueText(project.frozenUntil)}` : "Proyecto congelado sin fecha de revisión.",
        context: "Proyecto",
        date: iso(project.frozenUntil || project.updatedAt),
        href: `/projects/${project.id}`,
        status: "active",
      });
    }
    if (project.targetDate && daysFromNow(project.targetDate) <= 14) {
      items.push({
        id: `project-target-${project.id}`,
        sourceId: project.id,
        generated: true,
        type: "upcoming_date",
        severity: daysFromNow(project.targetDate) < 0 ? "critical" : "high",
        title: project.name,
        description: `Fecha objetivo · ${dueText(project.targetDate)}`,
        context: "Proyecto",
        date: iso(project.targetDate),
        href: `/projects/${project.id}`,
        status: "active",
      });
    }
    return items;
  });

  const assetSignals = assets.map((asset) => ({
    id: `asset-${asset.id}`,
    sourceId: asset.id,
    generated: true,
    type: "upcoming_date",
    severity: daysFromNow(asset.renewalDate) < 0 ? "high" : "medium",
    title: asset.name,
    description: `Renovación ${dueText(asset.renewalDate)} · ${asset.provider || asset.project?.name || "Activo"}`,
    context: "Activo",
    date: iso(asset.renewalDate),
    href: "/assets",
    status: "active",
  }));

  const ideaSignals = ideas.map((idea) => ({
    id: `idea-${idea.id}`,
    sourceId: idea.id,
    generated: true,
    type: "upcoming_date",
    severity: daysFromNow(idea.reviewDate) < 0 ? "medium" : "low",
    title: idea.title,
    description: `Fecha de revisión · ${dueText(idea.reviewDate)}`,
    context: "Idea",
    date: iso(idea.reviewDate),
    href: "/ideas",
    status: "active",
  }));

  const signals = [...taskSignals, ...projectSignals, ...assetSignals, ...ideaSignals].sort((a, b) => {
    const score = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
    return score[a.severity] - score[b.severity] || new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
  });

  const manual = manualAlerts.map((alert) => ({
    id: alert.id,
    sourceId: alert.id,
    generated: false,
    type: alert.type,
    severity: alert.severity,
    title: alert.title,
    description: alert.description || alert.source || "Alerta manual",
    context: alert.project?.name || alert.area?.name || "Manual",
    date: iso(alert.createdAt),
    href: alert.projectId ? `/projects/${alert.projectId}` : null,
    status: alert.status,
    area: alert.area,
    project: alert.project,
  }));

  return <AlertsView signals={signals} manualAlerts={manual} areas={areas as any} projects={projectOptions as any} />;
}
