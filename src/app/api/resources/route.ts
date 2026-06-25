import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validationError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
import { resourceDate, validateResourceLinks } from "@/lib/resource-api";
import { resourceSchema, secretFieldError } from "@/lib/resource-validation";
export const dynamic = "force-dynamic";
const include = { area: { select: { id: true, name: true } }, project: { select: { id: true, name: true } }, module: { select: { id: true, name: true } } } as const;
const types = ["domain", "hosting", "database", "repository", "api", "design_file", "provider", "tool", "account", "cloud_service", "payment_gateway", "analytics", "backup", "server", "other"];
const statuses = ["active", "inactive", "pending", "expired", "cancelled"];
export async function GET(request: NextRequest) {
  const auth = await requireApiSession(); if (auth) return auth; const query = request.nextUrl.searchParams; const type = query.get("type"); const status = query.get("status"); const direct = query.get("direct") === "true"; const projectId = query.get("projectId"); const moduleId = query.get("moduleId");
  if (type && !types.includes(type)) return apiError("El tipo de recurso no es válido."); if (status && !statuses.includes(status)) return apiError("El estado de recurso no es válido.");
  return NextResponse.json(await getPrisma().resource.findMany({ where: { areaId: query.get("areaId") ?? undefined, projectId: projectId ?? (direct ? null : undefined), moduleId: moduleId ?? (direct ? null : undefined), type: type ? type as never : undefined, status: status ? status as never : { not: "cancelled" } }, include, orderBy: [{ status: "asc" }, { name: "asc" }] }));
}
export async function POST(request: Request) {
  const auth = await requireApiSession(); if (auth) return auth; const body = await request.json(); const secretError = secretFieldError(body); if (secretError) return apiError(secretError);
  const parsed = resourceSchema.safeParse(body); if (!parsed.success) return validationError(parsed.error); const linkError = await validateResourceLinks(parsed.data); if (linkError) return linkError;
  try {
    const item = await getPrisma().resource.create({ data: resourceDate(parsed.data), include });
    await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.created", description: item.name } });
    if (item.credentialProvider === "la_caja") await getPrisma().activityLog.create({ data: { areaId: item.areaId, projectId: item.projectId, moduleId: item.moduleId, entityType: "Resource", entityId: item.id, action: "resource.credential_reference_added", description: item.credentialLabel ?? item.name } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { return prismaFailure(error); }
}
