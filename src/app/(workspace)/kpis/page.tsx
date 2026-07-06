import { KpisView } from "@/components/kpis/kpis-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function isoRequired(value: Date) {
  return value.toISOString();
}

export default async function KpisPage() {
  const prisma = getPrisma();

  const [areas, tasks, projects, assets, ideas, alerts, documents, boards] = await Promise.all([
    prisma.area.findMany({
      where: { status: { not: "archived" } },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
    prisma.task.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        isToday: true,
        isCritical: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        area: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, areaId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        maturity: true,
        nextAction: true,
        blockedReason: true,
        progressPercentage: true,
        targetDate: true,
        createdAt: true,
        updatedAt: true,
        area: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.digitalAsset.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        provider: true,
        status: true,
        renewalDate: true,
        createdAt: true,
        updatedAt: true,
        area: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, areaId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.idea.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        origin: true,
        potential: true,
        complexity: true,
        reviewDate: true,
        createdAt: true,
        updatedAt: true,
        area: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, areaId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.alert.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        type: true,
        createdAt: true,
        resolvedAt: true,
        area: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, areaId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.count(),
    prisma.board.count(),
  ]);

  return (
    <KpisView
      data={{
        areas,
        tasks: tasks.map((task) => ({
          ...task,
          dueDate: iso(task.dueDate),
          completedAt: iso(task.completedAt),
          createdAt: isoRequired(task.createdAt),
          updatedAt: isoRequired(task.updatedAt),
        })),
        projects: projects.map((project) => ({
          ...project,
          targetDate: iso(project.targetDate),
          createdAt: isoRequired(project.createdAt),
          updatedAt: isoRequired(project.updatedAt),
        })),
        assets: assets.map((asset) => ({
          ...asset,
          renewalDate: iso(asset.renewalDate),
          createdAt: isoRequired(asset.createdAt),
          updatedAt: isoRequired(asset.updatedAt),
        })),
        ideas: ideas.map((idea) => ({
          ...idea,
          reviewDate: iso(idea.reviewDate),
          createdAt: isoRequired(idea.createdAt),
          updatedAt: isoRequired(idea.updatedAt),
        })),
        alerts: alerts.map((alert) => ({
          ...alert,
          createdAt: isoRequired(alert.createdAt),
          resolvedAt: iso(alert.resolvedAt),
        })),
        knowledge: { documents, boards },
      }}
    />
  );
}
