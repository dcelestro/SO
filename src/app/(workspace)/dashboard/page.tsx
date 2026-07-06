import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const prisma = getPrisma();
  const [tasks, projects, assets, ideas] = await Promise.all([
    prisma.task.findMany({
      where: { status: { notIn: ["completed", "discarded"] } },
      include: { project: true },
    }),
    prisma.project.findMany({
      where: { status: { in: ["active", "blocked", "frozen"] } },
    }),
    prisma.digitalAsset.findMany({
      where: { status: { in: ["active", "pending"] }, renewalDate: { not: null } },
      include: { project: true },
    }),
    prisma.idea.findMany({
      where: { status: "inbox", reviewDate: { not: null } },
      include: { project: true },
    }),
  ]);

  return <DashboardView data={{ tasks, projects, assets, ideas } as any} />;
}
