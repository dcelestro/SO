"use server";

import { revalidatePath } from "next/cache";
import { requireActionSession } from "@/actions/auth";
import { getPrisma } from "@/lib/prisma";
import { dueItemSchema, normalizeDates } from "@/lib/validation";

const dueItemUpdateSchema = dueItemSchema.partial();

export async function getDueItems() {
  await requireActionSession();

  const prisma = getPrisma();
  return prisma.dueItem.findMany({
    include: { project: true, asset: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function createDueItem(payload: unknown) {
  await requireActionSession();

  const result = dueItemSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de vencimiento inválidos.");
  }

  const prisma = getPrisma();
  const dueItem = await prisma.dueItem.create({
    data: normalizeDates(result.data),
    include: { project: true, asset: true },
  });

  revalidatePath("/due-items");
  return dueItem;
}

export async function updateDueItem(id: string, payload: unknown) {
  await requireActionSession();

  const result = dueItemUpdateSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de vencimiento inválidos.");
  }

  const prisma = getPrisma();
  const dueItem = await prisma.dueItem.update({
    where: { id },
    data: normalizeDates(result.data),
    include: { project: true, asset: true },
  });

  revalidatePath("/due-items");
  return dueItem;
}

export async function deleteDueItem(id: string) {
  await requireActionSession();

  const prisma = getPrisma();
  await prisma.dueItem.delete({ where: { id } });

  revalidatePath("/due-items");
  return { success: true };
}

export async function markDueItemDone(id: string) {
  return updateDueItem(id, { status: "done" });
}
