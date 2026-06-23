import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { createDesktopShortcutSchema } from "@/lib/desktop-shortcut-validation";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  const shortcuts = await getPrisma().desktopShortcut.findMany({
    orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(shortcuts);
}

export async function POST(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  const result = createDesktopShortcutSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const shortcut = await getPrisma().desktopShortcut.create({ data: result.data });
  return NextResponse.json(shortcut, { status: 201 });
}
