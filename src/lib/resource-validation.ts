import { z } from "zod";
const optionalText = z.string().trim().nullish().transform((value) => value || null);
const normalizedUrl = z.string().trim().nullish().transform((value, context) => {
  if (!value) return null; const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try { return new URL(candidate).toString(); } catch { context.addIssue({ code: "custom", message: "La URL no tiene un formato válido." }); return z.NEVER; }
});
const renewalDate = z.string().trim().nullish().transform((value, context) => { if (!value) return null; if (Number.isNaN(new Date(`${value}T12:00:00`).getTime())) { context.addIssue({ code: "custom", message: "La fecha de renovación no es válida." }); return z.NEVER; } return value; });
const fields = {
  name: z.string().trim().min(1, "El nombre es obligatorio."), areaId: z.string().min(1, "El área es obligatoria."), projectId: optionalText, moduleId: optionalText,
  type: z.enum(["domain", "hosting", "database", "repository", "api", "design_file", "provider", "tool", "account", "cloud_service", "payment_gateway", "analytics", "backup", "server", "other"]),
  provider: optionalText, url: normalizedUrl, notes: optionalText, renewalDate,
  status: z.enum(["active", "inactive", "pending", "expired", "cancelled"]),
  credentialProvider: z.enum(["la_caja"]).nullish().transform((value) => value ?? null),
  credentialReference: z.string().trim().max(300).nullish().transform((value, context) => {
    if (!value) return null;
    if (!/^la-caja:\/\/credential\/[a-zA-Z0-9._-]+$/.test(value)) { context.addIssue({ code: "custom", message: "La referencia debe usar el formato la-caja://credential/identificador." }); return z.NEVER; }
    return value;
  }),
  credentialLabel: z.string().trim().max(200).nullish().transform((value) => value || null),
  credentialUsernameHint: z.string().trim().max(200).nullish().transform((value) => value || null),
};
export const resourceSchema = z.object(fields).superRefine((data, context) => { if (data.moduleId && !data.projectId) context.addIssue({ code: "custom", path: ["projectId"], message: "Un recurso de módulo también debe pertenecer a un proyecto." }); });
export const resourceUpdateSchema = z.object(fields).partial();

const forbiddenKeys = /^(password|token|api_?key|secret|private_?key|credential_?value|client_?secret|recovery_?code|seed_?phrase)$/i;
export function secretFieldError(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenKeys.test(key)) return `El campo ${key} no está permitido. Nexo no guarda secretos; use una referencia a La Caja.`;
    const nested = secretFieldError(child); if (nested) return nested;
  }
  return null;
}
