import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validationError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
import { resourceDate, validateResourceLinks } from "@/lib/resource-api";
import { resourceSchema, resourceUpdateSchema, secretFieldError } from "@/lib/resource-validation";
type Context = { params: Promise<{ id: string }> };
const include = { area: { select: { id: true, name: true } }, project: { select: { id: true, name: true } }, module: { select: { id: true, name: true } } } as const;
export async function GET(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; const { id } = await params; const item = await getPrisma().resource.findUnique({ where: { id }, include }); return item ? NextResponse.json(item) : apiError("El recurso no existe.", 404); }
export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiSession(); if (auth) return auth; const body = await request.json(); const secretError = secretFieldError(body); if (secretError) return apiError(secretError); const partial = resourceUpdateSchema.safeParse(body); if (!partial.success) return validationError(partial.error);
  try {
    const { id } = await params; const current = await getPrisma().resource.findUniqueOrThrow({ where: { id } });
    const merged = resourceSchema.safeParse({ ...current, renewalDate: current.renewalDate?.toISOString().slice(0, 10) ?? null, ...partial.data }); if (!merged.success) return validationError(merged.error);
    const linkError = await validateResourceLinks(merged.data); if (linkError) return linkError; const item = await getPrisma().resource.update({ where: { id }, data: resourceDate(partial.data), include });
    await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.updated", description: item.name } });
    if (!current.credentialProvider && item.credentialProvider === "la_caja") await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.credential_reference_added", description: item.credentialLabel ?? item.name } });
    if (current.credentialProvider === "la_caja" && !item.credentialProvider) await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.credential_reference_removed", description: item.name } });
    return NextResponse.json(item);
  } catch (error) { return prismaFailure(error); }
}
export async function DELETE(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; try { const { id } = await params; const item = await getPrisma().resource.update({ where: { id }, data: { status: "cancelled" }, include }); await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.archived", description: item.name } }); return NextResponse.json(item); } catch (error) { return prismaFailure(error); } }
