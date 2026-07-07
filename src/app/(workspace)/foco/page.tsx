import { FocusView } from "@/components/focus/focus-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function currentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export default async function FocoPage() {
  const prisma = getPrisma();
  const { start, end } = currentWeekRange();

  const [areas, projects, tasks, weeklyFocus] = await Promise.all([
    prisma.area.findMany({
      where: { status: { not: "archived" } },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { status: { notIn: ["discarded"] } },
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
        updatedAt: true,
        area: { select: { id: true, name: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.task.findMany({
      where: { status: { notIn: ["completed", "discarded"] } },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        isToday: true,
        isCritical: true,
        area: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.weeklyFocus.findFirst({
      where: { weekStartDate: start, weekEndDate: end },
      include: {
        secondaryProjects: { select: { projectId: true } },
        avoidProjects: { select: { projectId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <FocusView
      data={{
        weekStartDate: start.toISOString(),
        weekEndDate: end.toISOString(),
        areas,
        projects: projects.map((project) => ({
          ...project,
          targetDate: iso(project.targetDate),
          updatedAt: project.updatedAt.toISOString(),
        })),
        tasks: tasks.map((task) => ({
          ...task,
          dueDate: iso(task.dueDate),
        })),
        focus: weeklyFocus
          ? {
              id: weeklyFocus.id,
              mainProjectId: weeklyFocus.mainProjectId,
              weeklyGoal: weeklyFocus.weeklyGoal,
              notes: weeklyFocus.notes,
              secondaryProjectIds: weeklyFocus.secondaryProjects.map((item) => item.projectId),
              avoidProjectIds: weeklyFocus.avoidProjects.map((item) => item.projectId),
            }
          : null,
      }}
    />
  );
}
