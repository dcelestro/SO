"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActionSession } from "@/actions/auth";
import { getPrisma } from "@/lib/prisma";

const focusSchema = z.object({
  id: z.string().optional().nullable(),
  weekStartDate: z.string().datetime(),
  weekEndDate: z.string().datetime(),
  mainProjectId: z.string().optional().nullable(),
  secondaryProjectIds: z.array(z.string()).default([]),
  avoidProjectIds: z.array(z.string()).default([]),
  weeklyGoal: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export async function saveWeeklyFocus(payload: unknown) {
  await requireActionSession();

  const result = focusSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Datos de foco semanal inválidos.");
  }

  const data = result.data;
  const prisma = getPrisma();
  const weekStartDate = new Date(data.weekStartDate);
  const weekEndDate = new Date(data.weekEndDate);
  const mainProjectId = data.mainProjectId || null;

  const focus = await prisma.$transaction(async (tx) => {
    const current = data.id
      ? await tx.weeklyFocus.update({
          where: { id: data.id },
          data: {
            weekStartDate,
            weekEndDate,
            mainScopeType: mainProjectId ? "project" : null,
            mainAreaId: null,
            mainProjectId,
            mainModuleId: null,
            weeklyGoal: data.weeklyGoal || null,
            notes: data.notes || null,
          },
        })
      : await tx.weeklyFocus.create({
          data: {
            weekStartDate,
            weekEndDate,
            mainScopeType: mainProjectId ? "project" : null,
            mainAreaId: null,
            mainProjectId,
            mainModuleId: null,
            secondaryScopes: [],
            avoidScopes: [],
            weeklyGoal: data.weeklyGoal || null,
            notes: data.notes || null,
          },
        });

    await tx.weeklyFocusSecondaryProject.deleteMany({ where: { weeklyFocusId: current.id } });
    await tx.weeklyFocusAvoidProject.deleteMany({ where: { weeklyFocusId: current.id } });

    const secondaryProjectIds = Array.from(new Set(data.secondaryProjectIds)).filter((id) => id !== mainProjectId);
    const avoidProjectIds = Array.from(new Set(data.avoidProjectIds)).filter((id) => id !== mainProjectId);

    if (secondaryProjectIds.length) {
      await tx.weeklyFocusSecondaryProject.createMany({
        data: secondaryProjectIds.map((projectId) => ({ weeklyFocusId: current.id, projectId })),
        skipDuplicates: true,
      });
    }

    if (avoidProjectIds.length) {
      await tx.weeklyFocusAvoidProject.createMany({
        data: avoidProjectIds.map((projectId) => ({ weeklyFocusId: current.id, projectId })),
        skipDuplicates: true,
      });
    }

    await tx.activityLog.create({
      data: {
        projectId: mainProjectId,
        entityType: "WeeklyFocus",
        entityId: current.id,
        action: "weekly_focus.saved",
        description: data.weeklyGoal || "Foco semanal actualizado",
      },
    });

    return current;
  });

  revalidatePath("/focus");
  revalidatePath("/dashboard");

  return { success: true, id: focus.id };
}
