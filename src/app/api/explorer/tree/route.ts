import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getPrisma().area.findMany({
    where: { status: { not: "archived" } },
    select: {
      id: true, name: true, description: true, color: true, status: true,
      projects: {
        where: { status: { not: "discarded" } }, orderBy: { createdAt: "asc" },
        select: {
          id: true, areaId: true, name: true, description: true, status: true, priority: true,
          nextAction: true, blockedReason: true, progressPercentage: true,
          modules: {
            where: { status: { not: "discarded" } }, orderBy: { createdAt: "asc" },
            select: { id: true, areaId: true, projectId: true, name: true, description: true, status: true, priority: true, nextAction: true, blockedReason: true, progressPercentage: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  }));
}
