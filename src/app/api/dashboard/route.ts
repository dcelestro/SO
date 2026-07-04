import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const db = getPrisma(),
      now = new Date(),
      week = new Date(now);
    week.setDate(now.getDate() - 7);
    const horizon = new Date(now);
    horizon.setDate(now.getDate() + 30);
    const [
      weeklyFocus,
      criticalTasks,
      overdueTasks,
      attentionProjects,
      upcomingDueItems,
      active,
      blocked,
      frozen,
      pending,
      completed,
      ideas,
      reviews,
    ] = await Promise.all([
      db.weeklyFocus.findFirst({
        orderBy: { weekStartDate: "desc" },
        include: {
          mainProject: true,
          secondaryProjects: { include: { project: true } },
          avoidProjects: { include: { project: true } },
        },
      }),
      db.task.findMany({
        where: {
          status: { not: "completed" },
          OR: [
            { isCritical: true },
            { priority: { in: ["critical", "high"] } },
          ],
        },
        include: { project: true },
        take: 8,
      }),
      db.task.findMany({
        where: { status: { not: "completed" }, dueDate: { lt: now } },
        include: { project: true },
        take: 8,
      }),
      db.project.findMany({
        where: {
          OR: [
            { status: "blocked" },
            { status: "active", nextAction: null },
            { priority: "critical" },
          ],
        },
        include: { area: true },
        take: 8,
      }),
      db.dueItem.findMany({
        where: { status: "pending", dueDate: { lte: horizon } },
        include: { project: true },
        orderBy: { dueDate: "asc" },
      }),
      db.project.count({ where: { status: "active" } }),
      db.project.count({ where: { status: "blocked" } }),
      db.project.count({ where: { status: "frozen" } }),
      db.task.count({
        where: {
          status: {
            in: ["inbox", "pending", "in_progress", "waiting", "blocked"],
          },
        },
      }),
      db.task.count({
        where: { status: "completed", completedAt: { gte: week } },
      }),
      db.idea.count({
        where: { status: { notIn: ["archived", "promoted"] } },
      }),
      db.review.count({
        where: { status: "pending", nextReviewDate: { lt: now } },
      }),
    ]);
    return NextResponse.json({
      weeklyFocus,
      criticalTasks,
      overdueTasks,
      attentionProjects,
      upcomingDueItems,
      kpis: {
        activeProjects: active,
        blockedProjects: blocked,
        frozenProjects: frozen,
        pendingTasks: pending,
        completedThisWeek: completed,
        ideas,
        reviewsOverdue: reviews,
        upcomingDueItems: upcomingDueItems.length,
        projectsWithoutNextAction: attentionProjects.filter(
          (p) => p.status === "active" && !p.nextAction,
        ).length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}
