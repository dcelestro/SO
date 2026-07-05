"use server";

import { revalidatePath } from "next/cache";
import { requireActionSession } from "@/actions/auth";
import { getPrisma } from "@/lib/prisma";
import { ideaSchema, normalizeDates } from "@/lib/validation";

const ideaUpdateSchema = ideaSchema.partial();

export async function getIdeas() {
  await requireActionSession();

  const prisma = getPrisma();
  return prisma.idea.findMany({
    include: { project: true, area: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createIdea(payload: unknown) {
  await requireActionSession();

  const result = ideaSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de idea inválidos.");
  }

  const prisma = getPrisma();
  const idea = await prisma.idea.create({
    data: normalizeDates(result.data),
    include: { project: true, area: true },
  });

  revalidatePath("/ideas");
  return idea;
}

export async function updateIdea(id: string, payload: unknown) {
  await requireActionSession();

  const result = ideaUpdateSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de idea inválidos.");
  }

  const prisma = getPrisma();
  const idea = await prisma.idea.update({
    where: { id },
    data: normalizeDates(result.data),
    include: { project: true, area: true },
  });

  revalidatePath("/ideas");
  return idea;
}

export async function deleteIdea(id: string) {
  await requireActionSession();

  const prisma = getPrisma();
  await prisma.idea.delete({ where: { id } });

  revalidatePath("/ideas");
  return { success: true };
}

export async function promoteIdeaToProject(ideaId: string, areaId: string, projectName?: string) {
  await requireActionSession();

  const prisma = getPrisma();
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });

  if (!idea) throw new Error("Idea no encontrada.");
  if (idea.status === "promoted") throw new Error("La idea ya fue promovida a proyecto.");

  const project = await prisma.project.create({
    data: {
      name: projectName?.trim() || idea.title,
      description: idea.description,
      areaId,
      status: "idea",
      priority: idea.potential || "medium",
      maturity: "idea",
      projectType: "other",
    },
  });

  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: "promoted",
      projectId: project.id,
    },
    include: { project: true, area: true },
  });

  revalidatePath("/ideas");
  revalidatePath("/projects");
  return { project, idea: updatedIdea };
}
