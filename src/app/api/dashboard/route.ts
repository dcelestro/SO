import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getDashboardRadar } from "@/lib/dashboard-radar";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const radar = await getDashboardRadar();
    return NextResponse.json(radar);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
