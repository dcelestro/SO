"use server";
import { getPrisma } from "@/lib/prisma";
import { requireActionSession } from "@/actions/auth";
import { z } from "zod";

const ideaSchema = z.object({
  title: z.string().min(1, "El título no puede estar vacío"),
  description: z.string().optional(),
  origin: z.enum(["saas", "thirdparty", "personal"]).default("personal").optional(),
  destination: z.string().optional(),
});

export async function createIdea(payload: unknown) {
  await requireActionSession();
  
  const result = ideaSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de idea inválidos.");
  }
  
  const prisma = getPrisma();
  const idea = await prisma.idea.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      origin: result.data.origin || "personal",
      destination: result.data.destination,
      status: "inbox",
    },
  });
  
  return idea;
}

export async function getIdeas() {
  await requireActionSession();
  const prisma = getPrisma();
  return prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function promoteIdeaToProject(ideaId: string, areaId: string, projectName?: string) {
  await requireActionSession();
  const prisma = getPrisma();
  
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) throw new Error("Idea no encontrada.");
  if (idea.status === "promoted") throw new Error("La idea ya fue promovida a proyecto.");
  
  // Use sequential queries because we need the new project's ID to link to the idea,
  // or link the idea to the project after creation.
  const project = await prisma.project.create({
    data: {
      name: projectName || idea.title,
      description: idea.description,
      areaId,
      status: "idea", // Initial project state
      priority: "medium",
      maturity: "idea",
      projectType: "other",
    }
  });

  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: "promoted",
      projectId: project.id,
    }
  });

  return { project, idea: updatedIdea };
}
