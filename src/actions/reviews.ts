"use server";
import { prisma } from "@/lib/prisma";
import { reviewSchema, normalizeDates } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function createReview(payload: Record<string, unknown>) {
  const data = normalizeDates(payload);
  const parsed = reviewSchema.parse(data);
  const result = await prisma.review.create({ data: parsed });
  revalidatePath("/");
  return result;
}
