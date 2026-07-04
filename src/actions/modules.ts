"use server";
import { getPrisma } from "@/lib/prisma";
import { requireActionSession } from "@/actions/auth";
import { moduleSchema } from "@/lib/validation";

export async function getModules() {
  await requireActionSession();
  const prisma = getPrisma();
  return prisma.projectModule.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createModule(payload: unknown) {
  await requireActionSession();
  
  const result = moduleSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de módulo inválidos.");
  }
  
  const prisma = getPrisma();
  const projectModule = await prisma.projectModule.create({
    data: result.data,
  });
  
  return projectModule;
}

export async function updateModule(id: string, payload: unknown) {
  await requireActionSession();
  
  const result = moduleSchema.partial().safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de módulo inválidos.");
  }
  
  const prisma = getPrisma();
  const projectModule = await prisma.projectModule.update({
    where: { id },
    data: result.data,
  });
  
  return projectModule;
}

export async function deleteModule(id: string) {
  await requireActionSession();
  
  const prisma = getPrisma();
  await prisma.projectModule.delete({
    where: { id },
  });
  
  return { success: true };
}
