import { z } from "zod";

export const shortcutTypes = [
  "system",
  "area",
  "project",
  "module",
  "resource",
  "inbox",
  "alerts",
  "custom",
] as const;

const fields = {
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().nullish(),
  type: z.enum(shortcutTypes, { error: "El tipo de acceso no es válido" }),
  icon: z.string().trim().nullish(),
  color: z.string().trim().nullish(),
  targetType: z.string().trim().nullish(),
  targetId: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
  isPinned: z.boolean().default(false),
};

export const createDesktopShortcutSchema = z.object(fields);
export const updateDesktopShortcutSchema = z.object(fields).partial();
