"use server";
import { getPrisma } from "@/lib/prisma";
import { requireActionSession } from "@/actions/auth";
import { areaSchema } from "@/lib/validation";

export async function getAreas() {
  await requireActionSession();
  const prisma = getPrisma();
  return prisma.area.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createArea(payload: unknown) {
  await requireActionSession();
  
  const result = areaSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de área inválidos.");
  }
  
  const prisma = getPrisma();
  const area = await prisma.area.create({
    data: result.data,
  });
  
  return area;
}

export async function updateArea(id: string, payload: unknown) {
  await requireActionSession();
  
  const result = areaSchema.partial().safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de área inválidos.");
  }
  
  const prisma = getPrisma();
  const area = await prisma.area.update({
    where: { id },
    data: result.data,
  });
  
  return area;
}

export async function deleteArea(id: string) {
  await requireActionSession();
  
  const prisma = getPrisma();
  await prisma.area.delete({
    where: { id },
  });
  
  return { success: true };
}
