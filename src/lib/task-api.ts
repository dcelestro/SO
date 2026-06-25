import { apiError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
type Links = { areaId: string; projectId?: string | null; moduleId?: string | null };
export async function validateTaskLinks(data: Links) {
  const db = getPrisma(); const area = await db.area.findUnique({ where: { id: data.areaId } });
  if (!area) return apiError("El área indicada no existe.");
  if (data.projectId) { const project = await db.project.findUnique({ where: { id: data.projectId } }); if (!project || project.areaId !== data.areaId) return apiError("El proyecto no pertenece al área indicada."); }
  if (data.moduleId) { if (!data.projectId) return apiError("Una tarea de módulo también debe pertenecer a un proyecto."); const item = await db.projectModule.findUnique({ where: { id: data.moduleId } }); if (!item || item.projectId !== data.projectId || item.areaId !== data.areaId) return apiError("El módulo no pertenece al proyecto y área indicados."); }
  return null;
}
export function taskDates<T extends { dueDate?: string | null; startDate?: string | null }>(data: T) {
  return { ...data, dueDate: data.dueDate ? new Date(`${data.dueDate}T12:00:00`) : data.dueDate === null ? null : undefined, startDate: data.startDate ? new Date(`${data.startDate}T12:00:00`) : data.startDate === null ? null : undefined };
}
