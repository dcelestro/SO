import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { prismaFailure, validateModuleHierarchy, validationError } from "@/lib/explorer-api";
import { moduleSchema } from "@/lib/explorer-validation";
import { getPrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() { const auth = await requireApiSession(); if (auth) return auth; return NextResponse.json(await getPrisma().projectModule.findMany({ include: { area: true, project: true }, orderBy: { createdAt: "asc" } })); }
export async function POST(request: Request) { const auth = await requireApiSession(); if (auth) return auth; const parsed = moduleSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error); const linkError = await validateModuleHierarchy(parsed.data); if (linkError) return linkError; try { return NextResponse.json(await getPrisma().projectModule.create({ data: parsed.data }), { status: 201 }); } catch (error) { return prismaFailure(error); } }
