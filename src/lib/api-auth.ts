import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function requireApiSession() {
  if (process.env.AUTH_ENABLED !== "true") return null;
  const token = (await cookies()).get("nexo_session")?.value;
  const session = await verifySession(token);
  return session
    ? null
    : NextResponse.json({ error: "No autorizado." }, { status: 401 });
}
