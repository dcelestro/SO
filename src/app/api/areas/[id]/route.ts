import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { prismaFailure, validationError } from "@/lib/explorer-api";
import { areaUpdateSchema } from "@/lib/explorer-validation";
import { getPrisma } from "@/lib/prisma";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; const { id } = await params; const item = await getPrisma().area.findUnique({ where: { id }, include: { projects: { include: { modules: true } } } }); return item ? NextResponse.json(item) : NextResponse.json({ error: "El área no existe." }, { status: 404 }); }
export async function PATCH(request: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; const parsed = areaUpdateSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error); try { const { id } = await params; return NextResponse.json(await getPrisma().area.update({ where: { id }, data: parsed.data })); } catch (error) { return prismaFailure(error); } }
export async function DELETE(_: Request, { params }: Context) { const auth = await requireApiSession(); if (auth) return auth; try { const { id } = await params; return NextResponse.json(await getPrisma().area.update({ where: { id }, data: { status: "archived" } })); } catch (error) { return prismaFailure(error); } }
