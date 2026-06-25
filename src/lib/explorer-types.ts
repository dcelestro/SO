export type AreaStatus = "active" | "paused" | "archived";
export type ProjectStatus = "idea" | "analysis" | "active" | "paused" | "blocked" | "frozen" | "completed" | "discarded";
export type ModuleStatus = "planned" | "active" | "paused" | "blocked" | "completed" | "discarded";
export type Priority = "critical" | "high" | "medium" | "low";
export type ExplorerNodeType = "area" | "project" | "module";

export interface ExplorerModule {
  id: string; areaId: string; projectId: string; name: string; description: string | null;
  status: ModuleStatus; priority: Priority; nextAction: string | null; blockedReason: string | null;
  progressPercentage: number;
}
export interface ExplorerProject {
  id: string; areaId: string; name: string; description: string | null; status: ProjectStatus;
  priority: Priority; nextAction: string | null; blockedReason: string | null;
  progressPercentage: number; modules: ExplorerModule[];
}
export interface ExplorerArea {
  id: string; name: string; description: string | null; color: string | null;
  status: AreaStatus; projects: ExplorerProject[];
}
export type ExplorerSelection = { type: ExplorerNodeType; id: string } | null;
