export type ResourceType = "domain" | "hosting" | "database" | "repository" | "api" | "design_file" | "provider" | "tool" | "account" | "cloud_service" | "payment_gateway" | "analytics" | "backup" | "server" | "other";
export type ResourceStatus = "active" | "inactive" | "pending" | "expired" | "cancelled";
export interface ExplorerResource {
  id: string; name: string; areaId: string; projectId: string | null; moduleId: string | null; type: ResourceType;
  provider: string | null; url: string | null; notes: string | null; renewalDate: string | null; status: ResourceStatus;
  credentialProvider: "la_caja" | null; credentialReference: string | null; credentialLabel: string | null; credentialUsernameHint: string | null;
  createdAt: string; updatedAt: string; area: { id: string; name: string }; project: { id: string; name: string } | null; module: { id: string; name: string } | null;
}
