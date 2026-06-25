import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validateProjectArea, validationError } from "@/lib/explorer-api";
import { projectSchema, projectUpdateSchema } from "@/lib/explorer-validation";
import { getPrisma } from "@/lib/prisma";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; const { id } = await params; const item = await getPrisma().project.findUnique({ where: { id }, include: { area: true, modules: true } }); return item ? NextResponse.json(item) : apiError("El proyecto no existe.", 404); }
export async function PATCH(request: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; const partial = projectUpdateSchema.safeParse(await request.json()); if (!partial.success) return validationError(partial.error); try { const { id } = await params; const current = await getPrisma().project.findUniqueOrThrow({ where: { id } }); const parsed = projectSchema.safeParse({ ...current, ...partial.data }); if (!parsed.success) return validationError(parsed.error); const linkError = await validateProjectArea(parsed.data.areaId); if (linkError) return linkError; return NextResponse.json(await getPrisma().project.update({ where: { id }, data: partial.data })); } catch (error) { return prismaFailure(error); } }
export async function DELETE(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; try { const { id } = await params; return NextResponse.json(await getPrisma().project.update({ where: { id }, data: { status: "discarded" } })); } catch (error) { return prismaFailure(error); } }
