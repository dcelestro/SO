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
  documents: "document",
  credentials: "credential",
  resources: "resource",
  boards: "board",
  decisions: "decision",
  "important-dates": "importantDate",
  alerts: "alert",
  "inbox-items": "inboxItem",
  "weekly-focus": "weeklyFocus",
  "activity-log": "activityLog",
};

const includes: Record<string, object> = {
  projects: { area: true, _count: { select: { modules: true, tasks: true } } },
  modules: { project: true, area: true },
  tasks: { project: true, module: true, area: true },
  documents: { project: true, module: true, area: true },
  credentials: { project: true, module: true, area: true },
  resources: { project: true, module: true, area: true },
  boards: { project: true, module: true, area: true },
  decisions: { project: true, module: true, area: true },
  "important-dates": { project: true, module: true, area: true },
  alerts: { project: true, module: true, area: true },
};

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

function parse(resource: string, body: unknown, partial = false) {
  const schema = resource === "projects" ? projectSchema : resource === "tasks" ? taskSchema : null;
  if (!schema) return normalizeDates(body as Record<string, unknown>);
  const result = (partial ? schema.partial() : schema).safeParse(body);
  if (!result.success) throw new Error(result.error.issues[0]?.message || "Datos inválidos");
  return normalizeDates(result.data);
}

function model(db: ReturnType<typeof getPrisma>, resource: string) {
  const name = models[resource];
  if (!name) throw new Error("Recurso no encontrado");
  // Los delegados Prisma no comparten una interfaz CRUD común.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as unknown as Record<string, any>)[name];
}

export async function GET(_: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    const delegate = model(getPrisma(), resource);
    if (resource === "weekly-focus" && slug[0] === "current") {
      return NextResponse.json(await delegate.findFirst({ orderBy: { weekStartDate: "desc" } }));
    }
    if (slug[0]) {
      return NextResponse.json(await delegate.findUnique({ where: { id: slug[0] }, include: includes[resource] }));
    }
    return NextResponse.json(await delegate.findMany({ include: includes[resource], orderBy: { createdAt: "desc" } }));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Error";
    return error(message, message === "Recurso no encontrado" ? 404 : 500);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource } = await params;
    const created = await model(getPrisma(), resource).create({ data: parse(resource, await request.json()) });
    return NextResponse.json(created, { status: 201 });
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Error");
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    if (!slug[0]) return error("ID requerido");
    return NextResponse.json(await model(getPrisma(), resource).update({
      where: { id: slug[0] },
      data: parse(resource, await request.json(), true),
    }));
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Error");
  }
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;
  try {
    const { resource, slug = [] } = await params;
    if (!slug[0]) return error("ID requerido");
    await model(getPrisma(), resource).delete({ where: { id: slug[0] } });
    return new NextResponse(null, { status: 204 });
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Error");
  }
}
