import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { prismaFailure, validateProjectArea, validationError } from "@/lib/explorer-api";
import { projectSchema } from "@/lib/explorer-validation";
import { getPrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() { const auth = await requireApiSession(); if (auth) return auth; return NextResponse.json(await getPrisma().project.findMany({ include: { area: true, modules: true }, orderBy: { createdAt: "asc" } })); }
export async function POST(request: Request) { const auth = await requireApiSession(); if (auth) return auth; const parsed = projectSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error); const linkError = await validateProjectArea(parsed.data.areaId); if (linkError) return linkError; try { return NextResponse.json(await getPrisma().project.create({ data: parsed.data }), { status: 201 }); } catch (error) { return prismaFailure(error); } }
