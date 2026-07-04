"use server";
import { prisma } from "@/lib/prisma";
import { assetSchema, normalizeDates } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function createAsset(payload: Record<string, unknown>) {
  const data = normalizeDates(payload);
  const parsed = assetSchema.parse(data);
  const result = await prisma.digitalAsset.create({ data: parsed });
  revalidatePath("/");
  return result;
}
