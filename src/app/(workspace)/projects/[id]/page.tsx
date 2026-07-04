import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { getPrisma } from "@/lib/prisma";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const prisma = getPrisma();
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      area: true,
      tasks: true,
    }
  });

  if (!project) notFound();

  return <ProjectDetailView project={project as any} tasks={project.tasks as any} />;
}
