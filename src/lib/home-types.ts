export type HomePriority = "critical" | "high" | "medium" | "low";
export type HomeSeverity = "critical" | "high" | "warning" | "neutral";

export interface HomePath {
  area: string;
  project?: string;
  module?: string;
}

export interface HomeAttentionItem {
  id: string;
  kind: "task" | "project" | "module" | "resource";
  title: string;
  reason: string;
  severity: HomeSeverity;
  priority?: HomePriority;
  status: string;
  path: HomePath;
  href: string;
  updatedAt: string;
}

export interface HomeBlockedItem {
  id: string;
  title: string;
  status: "blocked" | "waiting";
  priority: HomePriority;
  path: HomePath;
  href: string;
  updatedAt: string;
}

export interface HomeColdProject {
  id: string;
  name: string;
  path: HomePath;
  href: string;
  lastActivityAt: string;
  daysInactive: number;
  openTaskCount: number;
  lastChangeType: "Proyecto" | "Tarea" | "Recurso" | "Pizarra";
}

export interface HomeActivityItem {
  id: string;
  entityType: string;
  title: string;
  action: string;
  path: HomePath;
  href: string;
  createdAt: string;
}

export interface HomeData {
  generatedAt: string;
  pulse: {
    importantOpenTasks: number;
    blockedOrWaitingTasks: number;
    coldProjects: number;
    recentEvents: number;
  };
  attentionItems: HomeAttentionItem[];
  blockedItems: HomeBlockedItem[];
  coldProjects: HomeColdProject[];
  recentActivity: HomeActivityItem[];
}

