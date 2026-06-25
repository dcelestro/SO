import type { Priority } from "@/lib/explorer-types";
export type TaskStatus = "inbox" | "pending" | "in_progress" | "waiting" | "blocked" | "completed" | "discarded";
export type TaskEnergy = "high" | "medium" | "low";
export type TaskContext = "development" | "design" | "research" | "admin" | "commercial" | "content" | "review" | "purchase" | "call" | "other";
export interface ExplorerTask {
  id: string; title: string; description: string | null; areaId: string; projectId: string | null; moduleId: string | null;
  status: TaskStatus; priority: Priority; dueDate: string | null; startDate: string | null; estimatedMinutes: number | null;
  energyLevel: TaskEnergy | null; context: TaskContext | null; completedAt: string | null; createdAt: string; updatedAt: string;
  area: { id: string; name: string }; project: { id: string; name: string } | null; module: { id: string; name: string } | null;
}
