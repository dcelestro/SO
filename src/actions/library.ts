"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { LibraryItemType, LibraryItemStatus, LibraryItemCategory } from "@prisma/client";

const prisma = getPrisma();

const secretPattern = /(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|Bearer\s+[a-zA-Z0-9-_\.]{20,}|xoxb-[a-zA-Z0-9-]{20,})/i;

const libraryItemSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  type: z.nativeEnum(LibraryItemType),
  category: z.nativeEnum(LibraryItemCategory),
  tags: z.array(z.string()).default([]),
  content: z.string().min(1, "El contenido no puede estar vacío").refine((val) => {
    return !secretPattern.test(val);
  }, {
    message: "No puedes guardar secretos reales (API keys, tokens, contraseñas). Usa placeholders como {{API_KEY}} en su lugar."
  }),
  variables: z.array(z.string()).default([]),
});

const updateLibraryItemSchema = libraryItemSchema.partial();

export async function createLibraryItem(data: z.infer<typeof libraryItemSchema>) {
  const validated = libraryItemSchema.parse(data);
  const item = await prisma.libraryItem.create({
    data: validated,
  });
  revalidatePath("/library");
  return item;
}

export async function updateLibraryItem(id: string, data: z.infer<typeof updateLibraryItemSchema>) {
  const validated = updateLibraryItemSchema.parse(data);
  const item = await prisma.libraryItem.update({
    where: { id },
    data: validated,
  });
  revalidatePath("/library");
  return item;
}

export async function archiveLibraryItem(id: string) {
  const item = await prisma.libraryItem.update({
    where: { id },
    data: { status: "archived" },
  });
  revalidatePath("/library");
  return item;
}
