import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { AssetsView } from "@/components/assets/assets-view";
import { IdeasView } from "@/components/ideas/ideas-view";
import { getPrisma } from "@/lib/prisma";

const sections = new Set([
  "dashboard",
  "explorer",
  "projects",
  "tasks",
  "library",
  "alerts",
  "archive",
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

async function getAssetsProps() {
  const prisma = getPrisma();
  const assets = await prisma.digitalAsset.findMany({
    include: { project: true, area: true },
    orderBy: { updatedAt: "desc" },
  });
  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["discarded"] } },
    orderBy: { name: "asc" },
  });
  const areas = await prisma.area.findMany({ orderBy: { name: "asc" } });
  return { assets, projects, areas };
}

async function getIdeasProps() {
  const prisma = getPrisma();
  const ideas = await prisma.idea.findMany({
    include: { project: true, area: true },
    orderBy: { updatedAt: "desc" },
  });
  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["discarded"] } },
    orderBy: { name: "asc" },
  });
  const areas = await prisma.area.findMany({ orderBy: { name: "asc" } });
  return { ideas, projects, areas };
}

export default async function Page({ params }: { params: Promise<{ section: string; id?: string[] }> }) {
  const { section, id } = await params;
  if (!sections.has(section)) notFound();

  if (section === "assets") {
    const props = await getAssetsProps();
    return <AssetsView assets={props.assets as any} projects={props.projects as any} areas={props.areas as any} />;
  }

  if (section === "ideas") {
    const props = await getIdeasProps();
    return <IdeasView ideas={props.ideas as any} projects={props.projects as any} areas={props.areas as any} />;
  }

  return <Workspace section={section} id={id?.[0]} />;
}
