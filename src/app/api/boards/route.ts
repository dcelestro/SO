import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validationError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
import { validateBoardLinks } from "@/lib/board-api";
import { boardSchema } from "@/lib/board-validation";
export const dynamic = "force-dynamic";
const include = { area: { select: { id: true, name: true } }, project: { select: { id: true, name: true } }, module: { select: { id: true, name: true } } } as const;
const types = ["whiteboard", "flowchart", "architecture", "process", "mindmap", "notes", "other"];
const statuses = ["draft", "active", "archived"];
export async function GET(request: NextRequest) {
  const auth = await requireApiSession(); if (auth) return auth; const query = request.nextUrl.searchParams; const type = query.get("type"); const status = query.get("status"); const direct = query.get("direct") === "true"; const projectId = query.get("projectId"); const moduleId = query.get("moduleId");
  if (type && !types.includes(type)) return apiError("El tipo de pizarra no es válido."); if (status && !statuses.includes(status)) return apiError("El estado de pizarra no es válido.");
  return NextResponse.json(await getPrisma().board.findMany({ where: { areaId: query.get("areaId") ?? undefined, projectId: projectId ?? (direct ? null : undefined), moduleId: moduleId ?? (direct ? null : undefined), type: type ? type as never : undefined, status: status ? status as never : { not: "archived" } }, include, orderBy: { updatedAt: "desc" } }));
}
export async function POST(request: Request) {
  const auth = await requireApiSession(); if (auth) return auth; const parsed = boardSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error); const linkError = await validateBoardLinks(parsed.data); if (linkError) return linkError;
  try { const board = await getPrisma().board.create({ data: parsed.data, include }); await getPrisma().activityLog.create({ data: { areaId: board.areaId, projectId: board.projectId, moduleId: board.moduleId, entityType: "Board", entityId: board.id, action: "board.created", description: board.title } }); return NextResponse.json(board, { status: 201 }); } catch (error) { return prismaFailure(error); }
}
