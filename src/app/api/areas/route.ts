import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { validationError, prismaFailure } from "@/lib/explorer-api";
import { areaSchema } from "@/lib/explorer-validation";
import { getPrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() { const auth = await requireApiSession(); if (auth) return auth; return NextResponse.json(await getPrisma().area.findMany({ orderBy: { createdAt: "asc" } })); }
export async function POST(request: Request) {
  const auth = await requireApiSession(); if (auth) return auth;
  const parsed = areaSchema.safeParse(await request.json()); if (!parsed.success) return validationError(parsed.error);
  try { return NextResponse.json(await getPrisma().area.create({ data: parsed.data }), { status: 201 }); } catch (error) { return prismaFailure(error); }
}
