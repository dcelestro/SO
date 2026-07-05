import { VencimientosView } from "@/components/vencimientos/vencimientos-view";
import { getPrisma } from "@/lib/prisma";

export default async function VencimientosPage() {
  const prisma = getPrisma();
  const items = await prisma.dueItem.findMany({
    include: { project: true, asset: true },
    orderBy: { dueDate: "asc" },
  });
  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["discarded"] } },
    orderBy: { name: "asc" },
  });
  const assets = await prisma.digitalAsset.findMany({ orderBy: { name: "asc" } });

  return <VencimientosView items={items as any} projects={projects as any} assets={assets as any} />;
}
