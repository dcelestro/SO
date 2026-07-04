import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
const sections = new Set([
  "dashboard",
  "desktop",
  "explorer",
  "projects",
  "tasks",
  "library",
  "focus",
  "ecosystem",
  "assets",
  "ideas",
  "due-items",
  "reviews",
  "kpis",
  "freezer",
  "settings",
]);
export default async function Page({ params }: { params: Promise<{ section: string; id?: string[] }> }) {
  const { section, id } = await params;
  if (!sections.has(section)) notFound();
  return <Workspace section={section} id={id?.[0]} />;
}

