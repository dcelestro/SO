import { z } from "zod";

const optionalDate = z.union([z.string().datetime(), z.string().date(), z.literal("")]).optional().nullable();

export const areaSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "archived"]).default("active"),
}).passthrough();

export const moduleSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().optional().nullable(),
  areaId: z.string().min(1, "El área es obligatoria."),
  projectId: z.string().min(1, "El proyecto es obligatorio."),
  status: z.enum(["planned", "active", "paused", "blocked", "completed", "discarded"]).default("planned"),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  progressPercentage: z.number().min(0).max(100).default(0),
  nextAction: z.string().trim().optional().nullable(),
  blockedReason: z.string().trim().optional().nullable(),
}).passthrough();

const projectBaseSchema = z.object({
  name: z.string().trim().min(2),
  areaId: z.string().min(1),
  status: z.enum(["idea", "analysis", "active", "paused", "blocked", "completed", "discarded", "frozen"]),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  maturity: z.enum(["idea", "validation", "design", "development", "testing", "production", "maintenance"]).default("idea"),
  projectType: z.enum(["app", "web", "ecommerce", "newsletter", "infrastructure", "admin", "content", "business", "other"]).default("other"),
  description: z.string().optional().nullable(),
  nextAction: z.string().trim().optional().nullable(),
  blockedReason: z.string().trim().optional().nullable(),
  progressPercentage: z.number().min(0).max(100).optional(),
  targetDate: optionalDate,
  frozenUntil: optionalDate,
}).passthrough();

export const projectSchema = projectBaseSchema.superRefine((value, ctx) => {
  if (value.status === "active" && !value.nextAction) {
    ctx.addIssue({ code: "custom", path: ["nextAction"], message: "Todo proyecto activo debe tener una próxima acción concreta." });
  }
});

export const projectUpdateSchema = projectBaseSchema.partial();

export const taskSchema = z.object({
  title: z.string().trim().min(2),
  status: z.enum(["inbox", "pending", "in_progress", "waiting", "blocked", "completed", "discarded"]).default("inbox"),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  projectId: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  dueDate: optionalDate,
}).passthrough();

export function normalizeDates<T extends Record<string, unknown>>(data: T) {
  const out = { ...data };
  for (const [key, value] of Object.entries(out)) {
    if ((key.endsWith("Date") || key.endsWith("At") || key === "frozenUntil") && typeof value === "string") {
      (out as Record<string, unknown>)[key] = value ? new Date(value) : null;
    }
  }
  return out;
}

export const assetSchema = z.object({
  name: z.string().trim().min(2),
  projectId: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  type: z.enum(["domain", "hosting", "database", "email", "api", "repository", "cloud_service", "payment_gateway", "social_media", "design_file", "analytics", "backup", "server", "legal_tax", "other"]).default("other"),
  provider: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  accountEmail: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  passwordManagerReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  renewalDate: optionalDate,
  cost: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "pending", "expired", "cancelled"]).default("active"),
}).passthrough();

export const ideaSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  potential: z.enum(["high", "medium", "low"]).optional().nullable(),
  complexity: z.enum(["high", "medium", "low"]).optional().nullable(),
  origin: z.enum(["saas", "thirdparty", "personal"]).default("personal"),
  destination: z.string().optional().nullable(),
  status: z.enum(["inbox", "archived", "promoted"]).default("personal").or(z.enum(["inbox", "archived", "promoted"]).default("inbox")),
  reviewDate: optionalDate,
  notes: z.string().optional().nullable(),
}).passthrough();
