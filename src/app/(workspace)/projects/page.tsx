import { ProjectsView } from "@/components/projects/projects-view";
import { getPrisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const prisma = getPrisma();
  const projects = await prisma.project.findMany({
    include: {
      area: true,
      tasks: {
        where: {
          status: {
            notIn: ["completed", "discarded"]
          }
        },
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return <ProjectsView projects={projects as any} />;
}
