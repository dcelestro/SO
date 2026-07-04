import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getPrisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const prisma = getPrisma();
  const [tasks, projects, dues, reviews] = await Promise.all([
    prisma.task.findMany({
      where: { status: { notIn: ["completed", "discarded"] } },
      include: { project: true }
    }),
    prisma.project.findMany({
      where: { status: { in: ["active", "blocked"] } },
    }),
    prisma.dueItem.findMany({
      where: { status: "pending" },
    }),
    prisma.review.findMany({
      where: { status: "pending" },
    })
  ]);

  const data = {
    tasks,
    projects,
    dues: dues.map(d => ({ ...d, amount: d.amount ? Number(d.amount) : null })),
    reviews
  };

  return <DashboardView data={data as any} />;
}
