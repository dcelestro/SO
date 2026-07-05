"use server";

import { revalidatePath } from "next/cache";
import { requireActionSession } from "@/actions/auth";
import { getPrisma } from "@/lib/prisma";
import { normalizeDates } from "@/lib/validation";

const alertTypes = new Set([
  "overdue_task",
  "missing_next_action",
  "upcoming_date",
  "blocked_project",
  "blocked_module",
  "inactive_project",
  "inactive_module",
  "too_many_active_projects",
  "manual",
  "other",
]);

const severities = new Set(["low", "medium", "high", "critical"]);
const statuses = new Set(["active", "resolved", "dismissed"]);

function readAlertPayload(payload: unknown) {
  const value = (payload || {}) as Record<string, unknown>;
  const title = String(value.title || "").trim();
  const areaId = String(value.areaId || "").trim();
  const projectId = value.projectId ? String(value.projectId) : null;
  const moduleId = value.moduleId ? String(value.moduleId) : null;
  const type = String(value.type || "manual");
  const severity = String(value.severity || "medium");
  const status = String(value.status || "active");

  if (title.length < 2) throw new Error("El título debe tener al menos 2 caracteres.");
  if (!areaId) throw new Error("El área es obligatoria.");
  if (!alertTypes.has(type)) throw new Error("Tipo de alerta inválido.");
  if (!severities.has(severity)) throw new Error("Severidad inválida.");
  if (!statuses.has(status)) throw new Error("Estado inválido.");

  return normalizeDates({
    title,
    description: value.description ? String(value.description) : null,
    areaId,
    projectId,
    moduleId,
    type,
    severity,
    status,
    source: value.source ? String(value.source) : "manual",
    resolvedAt: status === "resolved" ? new Date() : null,
  });
}

export async function createAlert(payload: unknown) {
  await requireActionSession();

  const prisma = getPrisma();
  const alert = await prisma.alert.create({
    data: readAlertPayload(payload),
    include: { area: true, project: true, module: true },
  });

  revalidatePath("/alerts");
  return alert;
}

export async function updateAlertStatus(id: string, status: "active" | "resolved" | "dismissed") {
  await requireActionSession();
  if (!statuses.has(status)) throw new Error("Estado inválido.");

  const prisma = getPrisma();
  const alert = await prisma.alert.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "resolved" ? new Date() : null,
    },
    include: { area: true, project: true, module: true },
  });

  revalidatePath("/alerts");
  return alert;
}

export async function deleteAlert(id: string) {
  await requireActionSession();

  const prisma = getPrisma();
  await prisma.alert.delete({ where: { id } });

  revalidatePath("/alerts");
  return { success: true };
}
