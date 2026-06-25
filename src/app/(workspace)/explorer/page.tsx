import { ExplorerShell } from "@/components/explorer/explorer-shell";
import type { ExplorerNodeType } from "@/lib/explorer-types";

export default async function ExplorerPage({ searchParams }: { searchParams: Promise<{ type?: string | string[]; id?: string | string[] }> }) {
  const query = await searchParams; const type = typeof query.type === "string" ? query.type : undefined; const id = typeof query.id === "string" ? query.id : undefined;
  const valid = type === "area" || type === "project" || type === "module";
  return <ExplorerShell initialSelection={valid && id ? { type: type as ExplorerNodeType, id } : null} />;
}
