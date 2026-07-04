import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getHomeData } from "@/lib/home-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getHomeData());
  } catch (error) {
    console.error("GET /api/home failed", error);
    return NextResponse.json({ error: "No se pudo cargar el Centro de Mando." }, { status: 500 });
  }
}
