"use server";
import { getPrisma } from "@/lib/prisma";
import { requireActionSession } from "@/actions/auth";
import { projectSchema } from "@/lib/validation";

export async function getProjects() {
  await requireActionSession();
  const prisma = getPrisma();
  return prisma.project.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createProject(payload: unknown) {
  await requireActionSession();
  
  const result = projectSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de proyecto inválidos.");
  }
  
  const prisma = getPrisma();
  const project = await prisma.project.create({
    data: result.data,
  });
  
  return project;
}

export async function updateProject(id: string, payload: unknown) {
  await requireActionSession();
  
  const result = projectSchema.partial().safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de proyecto inválidos.");
  }
  
  const prisma = getPrisma();
  const project = await prisma.project.update({
    where: { id },
    data: result.data,
  });
  
  return project;
}

export async function deleteProject(id: string) {
  await requireActionSession();
  
  const prisma = getPrisma();
  await prisma.project.delete({
    where: { id },
  });
  
  return { success: true };
}
