import { KpisView } from "@/components/kpis/kpis-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const day = 24 * 60 * 60 * 1000;
const now = () => new Date();
const inDays = (amount: number) => new Date(now().getTime() + amount * day);
const isPast = (value: Date | string | null | undefined) => Boolean(value && new Date(value).getTime() < now().getTime());

export default async function KpisPage() {
  const prisma = getPrisma();
  const next7 = inDays(7);
  const next14 = inDays(14);
  const next30 = inDays(30);
  const last30 = new Date(now().getTime() - 30 * day);

  const [tasks, projects, assets, ideas, alerts, documents, boards] = await Promise.all([
    prisma.task.findMany({ include: { project: true, area: true }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ include: { area: true }, orderBy: { updatedAt: "desc" } }),
    prisma.digitalAsset.findMany({ include: { project: true, area: true }, orderBy: { updatedAt: "desc" } }),
    prisma.idea.findMany({ include: { project: true, area: true }, orderBy: { updatedAt: "desc" } }),
    prisma.alert.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.document.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.board.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const openTasks = tasks.filter((task) => !["completed", "discarded"].includes(task.status));
  const overdueTasks = openTasks.filter((task) => isPast(task.dueDate));
  const dueSoonTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) <= next7 && !isPast(task.dueDate));
  const completedLast30 = tasks.filter((task) => task.completedAt && new Date(task.completedAt) >= last30);
  const blockedTasks = openTasks.filter((task) => ["blocked", "waiting"].includes(task.status));

  const activeProjects = projects.filter((project) => project.status === "active");
  const blockedProjects = projects.filter((project) => project.status === "blocked" || Boolean(project.blockedReason));
  const frozenProjects = projects.filter((project) => project.status === "frozen" || project.isFrozen);
  const withoutNextAction = activeProjects.filter((project) => !project.nextAction?.trim());
  const targetSoon = projects.filter((project) => project.targetDate && new Date(project.targetDate) <= next14 && !["completed", "discarded"].includes(project.status));
  const averageProgress = activeProjects.length ? Math.round(activeProjects.reduce((sum, project) => sum + project.progressPercentage, 0) / activeProjects.length) : 0;

  const activeAssets = assets.filter((asset) => ["active", "pending"].includes(asset.status));
  const renewalSoon = activeAssets.filter((asset) => asset.renewalDate && new Date(asset.renewalDate) <= next30);
  const expiredAssets = assets.filter((asset) => asset.status === "expired" || isPast(asset.renewalDate));

  const inboxIdeas = ideas.filter((idea) => idea.status === "inbox");
  const promotedIdeas = ideas.filter((idea) => idea.status === "promoted");
  const reviewSoon = inboxIdeas.filter((idea) => idea.reviewDate && new Date(idea.reviewDate) <= next14);

  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const riskyProjects = projects
    .filter((project) => !["completed", "discarded"].includes(project.status))
    .map((project) => {
      const relatedTasks = openTasks.filter((task) => task.projectId === project.id);
      const overdue = relatedTasks.filter((task) => isPast(task.dueDate)).length;
      const blocked = project.status === "blocked" || Boolean(project.blockedReason);
      const noNext = project.status === "active" && !project.nextAction?.trim();
      const targetClose = project.targetDate && new Date(project.targetDate) <= next14;
      const score = overdue * 3 + (blocked ? 4 : 0) + (noNext ? 3 : 0) + (targetClose ? 2 : 0);
      return { id: project.id, name: project.name, status: project.status, priority: project.priority, score, overdue, blocked, noNext, targetDate: project.targetDate ? project.targetDate.toISOString() : null };
    })
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return <KpisView kpis={{
    tasks: { total: tasks.length, open: openTasks.length, completedLast30: completedLast30.length, overdue: overdueTasks.length, dueSoon: dueSoonTasks.length, blocked: blockedTasks.length },
    projects: { total: projects.length, active: activeProjects.length, blocked: blockedProjects.length, frozen: frozenProjects.length, withoutNextAction: withoutNextAction.length, targetSoon: targetSoon.length, averageProgress },
    assets: { total: assets.length, active: activeAssets.length, renewalSoon: renewalSoon.length, expired: expiredAssets.length },
    ideas: { total: ideas.length, inbox: inboxIdeas.length, promoted: promotedIdeas.length, reviewSoon: reviewSoon.length, conversionRate: ideas.length ? Math.round((promotedIdeas.length / ideas.length) * 100) : 0 },
    alerts: { active: activeAlerts.length, critical: activeAlerts.filter((alert) => alert.severity === "critical").length, high: activeAlerts.filter((alert) => alert.severity === "high").length },
    knowledge: { documents: documents.length, boards: boards.length },
    riskyProjects,
  }} />;
}
