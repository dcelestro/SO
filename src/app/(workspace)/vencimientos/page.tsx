import { DueItemsView } from "@/components/due-items/due-items-view";
import { getPrisma } from "@/lib/prisma";

export default async function VencimientosPage() {
  const prisma = getPrisma();
  const items = await prisma.dueItem.findMany({
    include: { project: true, asset: true },
    orderBy: { dueDate: "asc" },
  });
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });
  const assets = await prisma.digitalAsset.findMany({ orderBy: { name: "asc" } });

  return <DueItemsView dueItems={items} projects={projects} assets={assets} />;
}
