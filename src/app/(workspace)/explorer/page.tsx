import { ExplorerShell } from "@/components/explorer/explorer-shell";
import type { ExplorerNodeType } from "@/lib/explorer-types";
import { getPrisma } from "@/lib/prisma";

export default async function ExplorerPage({ searchParams }: { searchParams: Promise<{ type?: string | string[]; id?: string | string[] }> }) {
  const query = await searchParams; const type = typeof query.type === "string" ? query.type : undefined; const id = typeof query.id === "string" ? query.id : undefined;
  const valid = type === "area" || type === "project" || type === "module";

  const prisma = getPrisma();
  const areas = await prisma.area.findMany({
    where: { status: { not: "archived" } },
    select: {
      id: true, name: true, description: true, color: true, status: true,
      projects: {
        where: { status: { not: "discarded" } }, orderBy: { createdAt: "asc" },
        select: {
          id: true, areaId: true, name: true, description: true, status: true, priority: true,
          nextAction: true, blockedReason: true, progressPercentage: true,
          modules: {
            where: { status: { not: "discarded" } }, orderBy: { createdAt: "asc" },
            select: { id: true, areaId: true, projectId: true, name: true, description: true, status: true, priority: true, nextAction: true, blockedReason: true, progressPercentage: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <ExplorerShell initialSelection={valid && id ? { type: type as ExplorerNodeType, id } : null} initialAreas={areas as any} />;
}
