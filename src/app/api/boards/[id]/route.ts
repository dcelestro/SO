import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { apiError, prismaFailure, validationError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
import { validateBoardLinks } from "@/lib/board-api";
import { boardSchema, boardUpdateSchema } from "@/lib/board-validation";

type Context = { params: Promise<{ id: string }> };

const include = {
  area: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  module: { select: { id: true, name: true } },
} as const;

export async function GET(_: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (auth) return auth;

  const { id } = await params;
  const board = await getPrisma().board.findUnique({ where: { id }, include });
  return board ? NextResponse.json(board) : apiError("La pizarra no existe.", 404);
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (auth) return auth;

  const partial = boardUpdateSchema.safeParse(await request.json());
  if (!partial.success) return validationError(partial.error);

  try {
    const { id } = await params;
    const current = await getPrisma().board.findUniqueOrThrow({ where: { id } });
    const merged = boardSchema.safeParse({ ...current, ...partial.data });
    if (!merged.success) return validationError(merged.error);

    const linkError = await validateBoardLinks(merged.data);
    if (linkError) return linkError;

    const board = await getPrisma().board.update({ where: { id }, data: partial.data, include });
    await getPrisma().activityLog.create({
      data: {
        areaId: board.areaId,
        projectId: board.projectId,
        moduleId: board.moduleId,
        entityType: "Board",
        entityId: board.id,
        action: "board.updated",
        description: board.title,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    return prismaFailure(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const auth = await requireApiSession();
  if (auth) return auth;

  try {
    const { id } = await params;
    const prisma = getPrisma();
    const board = await prisma.board.findUniqueOrThrow({ where: { id } });

    await prisma.activityLog.create({
      data: {
        areaId: board.areaId,
        projectId: board.projectId,
        moduleId: board.moduleId,
        entityType: "Board",
        entityId: board.id,
        action: "board.deleted",
        description: board.title,
      },
    });

    await prisma.board.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return prismaFailure(error);
  }
}
