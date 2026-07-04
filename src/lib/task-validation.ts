import { z } from "zod";
const optionalText = z.string().trim().nullish().transform((value) => value || null);
const optionalDate = z.string().trim().nullish().transform((value) => value || null);
const fields = {
  title: z.string().trim().min(1, "El título es obligatorio."), description: optionalText,
  areaId: optionalText, projectId: optionalText, moduleId: optionalText,
  status: z.enum(["inbox", "pending", "in_progress", "waiting", "blocked", "completed", "discarded"]),
  priority: z.enum(["critical", "high", "medium", "low"]), dueDate: optionalDate, startDate: optionalDate,
  estimatedMinutes: z.coerce.number().int().positive().nullish().transform((value) => value ?? null),
  energyLevel: z.enum(["high", "medium", "low"]).nullish(),
  context: z.enum(["development", "design", "research", "admin", "commercial", "content", "review", "purchase", "call", "other"]).nullish(),
};
export const taskSchema = z.object(fields).superRefine((data, context) => {
  if (data.moduleId && !data.projectId) context.addIssue({ code: "custom", path: ["projectId"], message: "Una tarea de módulo también debe pertenecer a un proyecto." });
});
export const taskUpdateSchema = z.object(fields).partial();
