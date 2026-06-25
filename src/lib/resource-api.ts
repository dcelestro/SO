import { apiError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
type Links = { areaId: string; projectId?: string | null; moduleId?: string | null };
export async function validateResourceLinks(data: Links) {
  const db = getPrisma(); const area = await db.area.findUnique({ where: { id: data.areaId } }); if (!area) return apiError("El área indicada no existe.");
  if (data.projectId) { const project = await db.project.findUnique({ where: { id: data.projectId } }); if (!project || project.areaId !== data.areaId) return apiError("El proyecto no pertenece al área indicada."); }
  if (data.moduleId) { if (!data.projectId) return apiError("Un recurso de módulo también debe pertenecer a un proyecto."); const item = await db.projectModule.findUnique({ where: { id: data.moduleId } }); if (!item || item.projectId !== data.projectId || item.areaId !== data.areaId) return apiError("El módulo no pertenece al proyecto y área indicados."); }
  return null;
}
export function resourceDate<T extends { renewalDate?: string | null }>(data: T) { return { ...data, renewalDate: data.renewalDate ? new Date(`${data.renewalDate}T12:00:00`) : data.renewalDate === null ? null : undefined }; }
