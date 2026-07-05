"use server";

import { revalidatePath } from "next/cache";
import { requireActionSession } from "@/actions/auth";
import { getPrisma } from "@/lib/prisma";
import { assetSchema, normalizeDates } from "@/lib/validation";

const assetUpdateSchema = assetSchema.partial();

export async function getAssets() {
  await requireActionSession();

  const prisma = getPrisma();
  return prisma.digitalAsset.findMany({
    include: { project: true, area: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createAsset(payload: unknown) {
  await requireActionSession();

  const result = assetSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de activo inválidos.");
  }

  const prisma = getPrisma();
  const asset = await prisma.digitalAsset.create({
    data: normalizeDates(result.data),
    include: { project: true, area: true },
  });

  revalidatePath("/assets");
  return asset;
}

export async function updateAsset(id: string, payload: unknown) {
  await requireActionSession();

  const result = assetUpdateSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de activo inválidos.");
  }

  const prisma = getPrisma();
  const asset = await prisma.digitalAsset.update({
    where: { id },
    data: normalizeDates(result.data),
    include: { project: true, area: true },
  });

  revalidatePath("/assets");
  return asset;
}

export async function deleteAsset(id: string) {
  await requireActionSession();

  const prisma = getPrisma();
  await prisma.digitalAsset.delete({ where: { id } });

  revalidatePath("/assets");
  return { success: true };
}
