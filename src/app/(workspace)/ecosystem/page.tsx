import { EcosystemView } from "@/components/ecosystem/ecosystem-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EcosystemPage() {
  const prisma = getPrisma();
  const areas = await prisma.area.findMany({
    where: { status: { not: "archived" } },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      status: true,
      projects: {
        where: { status: { not: "discarded" } },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          areaId: true,
          status: true,
          priority: true,
          maturity: true,
          nextAction: true,
          blockedReason: true,
          progressPercentage: true,
          updatedAt: true,
          modules: {
            where: { status: { not: "discarded" } },
            select: { id: true, name: true, status: true, priority: true },
          },
          tasks: {
            where: { status: { notIn: ["completed", "discarded"] } },
            select: { id: true, status: true, priority: true, dueDate: true, isCritical: true },
          },
          assets: {
            where: { status: { in: ["active", "pending", "expired"] } },
            select: { id: true, status: true, renewalDate: true },
          },
          ideas: {
            where: { status: "inbox" },
            select: { id: true, reviewDate: true },
          },
          alerts: {
            where: { status: "active" },
            select: { id: true, severity: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <EcosystemView areas={areas as any} />;
}
