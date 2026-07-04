export type HomeWidgetKind = "internal" | "external";

export interface HomeWidgetDefinition {
  id: "pulse" | "attention" | "blocked" | "cold-projects" | "recent-activity";
  kind: HomeWidgetKind;
  order: number;
}

export const HOME_WIDGET_REGISTRY: HomeWidgetDefinition[] = [
  { id: "pulse", kind: "internal", order: 1 },
  { id: "attention", kind: "internal", order: 2 },
  { id: "blocked", kind: "internal", order: 3 },
  { id: "cold-projects", kind: "internal", order: 4 },
  { id: "recent-activity", kind: "internal", order: 5 },
];

