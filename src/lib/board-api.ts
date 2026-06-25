import { apiError } from "@/lib/explorer-api";
import { getPrisma } from "@/lib/prisma";
export async function validateBoardLinks(data: { areaId: string; projectId?: string | null; moduleId?: string | null }) {
  const db = getPrisma(); const area = await db.area.findUnique({ where: { id: data.areaId } }); if (!area) return apiError("El área indicada no existe.");
  if (data.projectId) { const project = await db.project.findUnique({ where: { id: data.projectId } }); if (!project || project.areaId !== data.areaId) return apiError("El proyecto no pertenece al área indicada."); }
  if (data.moduleId) { if (!data.projectId) return apiError("Una pizarra de módulo también debe pertenecer a un proyecto."); const item = await db.projectModule.findUnique({ where: { id: data.moduleId } }); if (!item || item.projectId !== data.projectId || item.areaId !== data.areaId) return apiError("El módulo no pertenece al proyecto y área indicados."); }
  return null;
}
