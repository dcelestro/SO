import { z } from "zod";

const optionalText = z.string().trim().nullish().transform((value) => value || null);
const progress = z.coerce.number().int().min(0).max(100).default(0);

export const areaSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "El color no es válido."),
  status: z.enum(["active", "paused", "archived"]),
});

const projectFields = {
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
  areaId: z.string().min(1, "El área es obligatoria."),
  status: z.enum(["idea", "analysis", "active", "paused", "blocked", "frozen", "completed", "discarded"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  nextAction: optionalText,
  blockedReason: optionalText,
  progressPercentage: progress,
};

const moduleFields = {
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
  areaId: z.string().min(1, "El área es obligatoria."),
  projectId: z.string().min(1, "El proyecto es obligatorio."),
  status: z.enum(["planned", "active", "paused", "blocked", "completed", "discarded"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  nextAction: optionalText,
  blockedReason: optionalText,
  progressPercentage: progress,
};

function validateState<T extends { status: string; nextAction?: string | null; blockedReason?: string | null }>(data: T, context: z.RefinementCtx, kind: "proyecto" | "módulo") {
  if (data.status === "active" && !data.nextAction) context.addIssue({ code: "custom", path: ["nextAction"], message: `Todo ${kind} activo debe tener una próxima acción concreta.` });
  if (data.status === "blocked" && !data.blockedReason) context.addIssue({ code: "custom", path: ["blockedReason"], message: `Todo ${kind} bloqueado debe tener un motivo de bloqueo.` });
}

export const projectSchema = z.object(projectFields).superRefine((data, context) => validateState(data, context, "proyecto"));
export const moduleSchema = z.object(moduleFields).superRefine((data, context) => validateState(data, context, "módulo"));
export const areaUpdateSchema = areaSchema.partial();
export const projectUpdateSchema = z.object(projectFields).partial();
export const moduleUpdateSchema = z.object(moduleFields).partial();
