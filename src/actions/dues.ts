"use server";
import { prisma } from "@/lib/prisma";
import { dueItemSchema, normalizeDates } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function createDueItem(payload: Record<string, unknown>) {
  const data = normalizeDates(payload);
  const parsed = dueItemSchema.parse(data);
  const result = await prisma.dueItem.create({ data: parsed });
  revalidatePath("/");
  return result;
}
