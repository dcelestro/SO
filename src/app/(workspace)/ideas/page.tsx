import { IdeasView } from "@/components/ideas/ideas-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const prisma = getPrisma();
  const [ideas, projects, areas] = await Promise.all([
    prisma.idea.findMany({
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

  return <IdeasView ideas={ideas as any} projects={projects as any} areas={areas as any} />;
}
