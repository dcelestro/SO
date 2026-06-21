import { z } from "zod";

const optionalDate = z.union([z.string().datetime(), z.string().date(), z.literal("")]).optional().nullable();
export const projectSchema = z.object({
  name: z.string().trim().min(2), areaId: z.string().min(1), status: z.enum(["idea","active","paused","blocked","completed","discarded","frozen"]),
  priority: z.enum(["critical","high","medium","low"]).default("medium"), maturity: z.enum(["idea","validation","design","development","testing","production","maintenance"]).default("idea"),
  projectType: z.enum(["app","web","ecommerce","newsletter","infrastructure","admin","content","business","other"]).default("other"), description: z.string().optional().nullable(), nextAction: z.string().trim().optional().nullable(), targetDate: optionalDate,
}).passthrough().superRefine((value, ctx) => { if (value.status === "active" && !value.nextAction) ctx.addIssue({ code:"custom", path:["nextAction"], message:"Todo proyecto activo debe tener una próxima acción concreta." }); });
export const taskSchema = z.object({ title:z.string().trim().min(2), status:z.enum(["inbox","pending","in_progress","waiting","blocked","completed","discarded"]).default("inbox"), priority:z.enum(["critical","high","medium","low"]).default("medium"), projectId:z.string().optional().nullable(), areaId:z.string().optional().nullable(), dueDate:optionalDate }).passthrough();
export function normalizeDates<T extends Record<string, unknown>>(data:T) { const out={...data}; for (const [key,value] of Object.entries(out)) if ((key.endsWith("Date") || key.endsWith("At") || key === "frozenUntil") && typeof value === "string") (out as Record<string,unknown>)[key]=value ? new Date(value) : null; return out; }
