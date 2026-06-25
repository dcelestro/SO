import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validationError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
import { taskDates, validateTaskLinks } from "@/lib/task-api";
import { taskSchema } from "@/lib/task-validation";
export const dynamic = "force-dynamic";
const include = { area: { select: { id: true, name: true } }, project: { select: { id: true, name: true } }, module: { select: { id: true, name: true } } } as const;
export async function GET(request: NextRequest) {
  const auth = await requireApiSession(); if (auth) return auth; const query = request.nextUrl.searchParams; const status = query.get("status"); const direct = query.get("direct") === "true"; const projectId = query.get("projectId"); const moduleId = query.get("moduleId");
  if (status && !["inbox", "pending", "in_progress", "waiting", "blocked", "completed", "discarded"].includes(status)) return apiError("El estado de tarea no es válido.");
  return NextResponse.json(await getPrisma().task.findMany({ where: { areaId: query.get("areaId") ?? undefined, projectId: projectId ?? (direct ? null : undefined), moduleId: moduleId ?? (direct ? null : undefined), status: status ? status as never : { not: "discarded" } }, include, orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }] }));
}
export async function POST(request: Request) {
  const auth = await requireApiSession(); if (auth) return auth; const parsed = taskSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error); const linkError = await validateTaskLinks(parsed.data); if (linkError) return linkError;
  try { const data = taskDates(parsed.data); const task = await getPrisma().task.create({ data: { ...data, completedAt: parsed.data.status === "completed" ? new Date() : null }, include }); await getPrisma().activityLog.create({ data: { areaId: task.areaId, projectId: task.projectId, moduleId: task.moduleId, entityType: "Task", entityId: task.id, action: "task.created", description: task.title } }); return NextResponse.json(task, { status: 201 }); } catch (error) { return prismaFailure(error); }
}
