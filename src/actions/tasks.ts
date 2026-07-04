"use server";

import { getPrisma } from "@/lib/prisma";
import { requireActionSession } from "@/actions/auth";
import { normalizeDates, taskSchema } from "@/lib/validation";

export async function getTasks() {
  await requireActionSession();
  const prisma = getPrisma();
  return prisma.task.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createTask(payload: unknown) {
  await requireActionSession();

  const result = taskSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de tarea inválidos.");
  }

  const prisma = getPrisma();
  const task = await prisma.task.create({
    data: normalizeDates(result.data),
  });

  return task;
}

export async function updateTask(id: string, payload: unknown) {
  await requireActionSession();

  const result = taskSchema.partial().safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de tarea inválidos.");
  }

  const prisma = getPrisma();
  const task = await prisma.task.update({
    where: { id },
    data: normalizeDates(result.data),
  });

  return task;
}

export async function deleteTask(id: string) {
  await requireActionSession();

  const prisma = getPrisma();
  await prisma.task.delete({
    where: { id },
  });

  return { success: true };
}
