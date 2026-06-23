import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { updateDesktopShortcutSchema } from "@/lib/desktop-shortcut-validation";
import { getPrisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

function prismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: "Acceso directo no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ error: "No se pudo procesar el acceso directo" }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  const result = updateDesktopShortcutSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  try {
    const { id } = await params;
    return NextResponse.json(
      await getPrisma().desktopShortcut.update({ where: { id }, data: result.data }),
    );
  } catch (error) {
    return prismaError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await getPrisma().desktopShortcut.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return prismaError(error);
  }
}
