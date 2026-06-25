import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { getPrisma } from "@/lib/prisma";

export const apiError = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
export const validationError = (error: ZodError) => apiError(error.issues[0]?.message ?? "Datos inválidos.");
export function prismaFailure(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return apiError("El elemento no existe.", 404);
    if (error.code === "P2002") return apiError("Ya existe un elemento con ese nombre.", 409);
  }
  return apiError("No se pudo completar la operación.", 500);
}

export async function validateProjectArea(areaId: string) {
  const area = await getPrisma().area.findUnique({ where: { id: areaId } });
  return area ? null : apiError("El área indicada no existe.");
}

export async function validateModuleHierarchy(data: { areaId: string; projectId: string }) {
  const project = await getPrisma().project.findUnique({ where: { id: data.projectId } });
  if (!project || project.areaId !== data.areaId) {
    return apiError("El proyecto no pertenece al área indicada.");
  }
  return null;
}
