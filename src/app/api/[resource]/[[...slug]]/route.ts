import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { normalizeDates, projectSchema, taskSchema } from "@/lib/validation";
import { requireApiSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ resource: string; slug?: string[] }> };
const models: Record<string, string> = {
  areas: "area",
  projects: "project",
  modules: "projectModule",
  tasks: "task",
  assets: "digitalAsset",
  ideas: "idea",
  "due-items": "dueItem",
  reviews: "review",
  documents: "document",
  credentials: "credential",
  resources: "resource",
  boards: "board",
  decisions: "decision",
  "important-dates": "importantDate",
  alerts: "alert",
  "inbox-items": "inboxItem",
  "weekly-focus": "weeklyFocus",
  notes: "note",
  "activity-log": "activityLog",
};
const includes: Record<string, object> = {
  projects: {
    area: true,
    _count: {
      select: { modules: true, tasks: true, dueItems: true, assets: true, ideas: true },
    },
  },
  modules: { project: true, area: true },
  tasks: { project: true, module: true, area: true },
  assets: { project: true, area: true },
  ideas: { project: true, area: true },
  "due-items": { project: true, asset: true },
  reviews: { project: true, area: true },
  documents: { project: true, module: true, area: true },
  credentials: { project: true, module: true, area: true },
  resources: { project: true, module: true, area: true },
  boards: { project: true, module: true, area: true },
  decisions: { project: true, module: true, area: true },
  "important-dates": { project: true, module: true, area: true },
  alerts: { project: true, module: true, area: true },
  "weekly-focus": {
    mainProject: true,
    secondaryProjects: { include: { project: true } },
    avoidProjects: { include: { project: true } },
  },
  notes: { project: true, area: true },
};
const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });
function parse(resource: string, body: unknown, partial = false) {
  const schema =
    resource === "projects"
      ? projectSchema
      : resource === "tasks"
        ? taskSchema
        : null;
  if (!schema) return normalizeDates(body as Record<string, unknown>);
  const result = (partial ? schema.partial() : schema).safeParse(body);
  if (!result.success)
    throw new Error(result.error.issues[0]?.message || "Datos inválidos");
  return normalizeDates(result.data);
}
// Prisma no expone un tipo común para delegados; el recurso se valida antes del acceso dinámico.
function model(db: ReturnType<typeof getPrisma>, resource: string) {
  const name = models[resource];
  if (!name) throw new Error("Recurso no encontrado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as unknown as Record<string, any>)[name];
}

export async function GET(_: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    const db = getPrisma();
    const m = model(db, resource);
    if (resource === "weekly-focus" && slug[0] === "current")
      return NextResponse.json(
        await m.findFirst({
          orderBy: { weekStartDate: "desc" },
          include: includes[resource],
        }),
      );
    if (slug[0])
      return NextResponse.json(
        await m.findUnique({
          where: { id: slug[0] },
          include: includes[resource],
        }),
      );
    return NextResponse.json(
      await m.findMany({
        include: includes[resource],
        orderBy: { updatedAt: "desc" },
      }),
    );
  } catch (e) {
    return error(e instanceof Error ? e.message : "Error", 500);
  }
}
export async function POST(req: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    if (["areas", "projects", "modules", "tasks"].includes(resource)) {
      return error("Este recurso migró a Server Actions nativas.", 403);
    }
    const db = getPrisma();
    const m = model(db, resource);
    const body = await req.json();
    const id = slug[0],
      action = slug[1];
    if (id && action === "freeze") {
      if (!body.frozenReason)
        return error("El motivo de congelamiento es obligatorio.");
      return NextResponse.json(
        await m.update({
          where: { id },
          data: {
            status: "frozen",
            isFrozen: true,
            frozenReason: body.frozenReason,
            frozenUntil: body.frozenUntil ? new Date(body.frozenUntil) : null,
          },
        }),
      );
    }
    if (id && action === "unfreeze") {
      if (body.status === "active" && !body.nextAction)
        return error(
          "Todo proyecto activo debe tener una próxima acción concreta.",
        );
      return NextResponse.json(
        await m.update({
          where: { id },
          data: {
            status: body.status || "paused",
            isFrozen: false,
            frozenReason: null,
            frozenUntil: null,
            nextAction: body.nextAction || undefined,
          },
        }),
      );
    }
    if (id && action === "complete") {
      return NextResponse.json(
        await m.update({
          where: { id },
          data: { status: "completed", completedAt: new Date() },
        }),
      );
    }
    if (id && action === "mark-done") {
      const data =
        resource === "reviews"
          ? { status: "done", lastReviewDate: new Date() }
          : { status: "done" };
      return NextResponse.json(await m.update({ where: { id }, data }));
    }
    if (id && action === "convert-to-project") {
      const idea = await db.idea.findUniqueOrThrow({ where: { id } });
      const project = await db.project.create({
        data: {
          name: idea.title,
          description: idea.description,
          areaId: idea.areaId!,
          status: body.status || "idea",
          priority: body.priority || "medium",
          maturity: "idea",
          projectType: body.projectType || "other",
          nextAction: body.nextAction || null,
        },
      });
      await db.idea.update({
        where: { id },
        data: { status: "promoted", projectId: project.id },
      });
      return NextResponse.json(project, { status: 201 });
    }
    return NextResponse.json(await m.create({ data: parse(resource, body) }), {
      status: 201,
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Error", 400);
  }
}
export async function PATCH(req: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    if (["areas", "projects", "modules", "tasks"].includes(resource)) {
      return error("Este recurso migró a Server Actions nativas.", 403);
    }
    if (!slug[0]) return error("ID requerido");
    const db = getPrisma();
    return NextResponse.json(
      await model(db, resource).update({
        where: { id: slug[0] },
        data: parse(resource, await req.json(), true),
      }),
    );
  } catch (e) {
    return error(e instanceof Error ? e.message : "Error", 400);
  }
}
export async function DELETE(_: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    if (["areas", "projects", "modules", "tasks"].includes(resource)) {
      return error("Este recurso migró a Server Actions nativas.", 403);
    }
    if (!slug[0]) return error("ID requerido");
    const db = getPrisma();
    await model(db, resource).delete({ where: { id: slug[0] } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Error", 400);
  }
}
