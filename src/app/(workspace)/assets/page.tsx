import { AssetsView } from "@/components/assets/assets-view";
import { getPrisma } from "@/lib/prisma";

export default async function AssetsPage() {
  const prisma = getPrisma();
  const [assets, projects, areas] = await Promise.all([
    prisma.digitalAsset.findMany({
      include: { project: true, area: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { status: { notIn: ["discarded"] } },
      orderBy: { name: "asc" },
    }),
    prisma.area.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return <AssetsView assets={assets as any} projects={projects as any} areas={areas as any} />;
}
