import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  const db = getPrisma();
  const [areas, projects, modules, openTasks, activeAlerts, inboxItems, upcomingDates] =
    await Promise.all([
      db.area.count({ where: { status: "active" } }),
      db.project.count({ where: { status: "active" } }),
      db.projectModule.count({ where: { status: "active" } }),
      db.task.count({ where: { status: { in: ["inbox", "pending", "in_progress", "waiting", "blocked"] } } }),
      db.alert.count({ where: { status: "active" } }),
      db.inboxItem.count({ where: { status: "pending" } }),
      db.importantDate.findMany({
        where: { status: "pending", date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
      }),
    ]);

  return NextResponse.json({
    counts: { areas, projects, modules, openTasks, activeAlerts, inboxItems },
    upcomingDates,
  });
}
