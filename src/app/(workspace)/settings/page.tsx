import { SettingsView } from "@/components/settings/settings-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const prisma = getPrisma();

  const [areas, projects, tasks, assets, ideas, boards, documents, users] = await Promise.all([
    prisma.area.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.digitalAsset.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.idea.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.board.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.document.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const areaRows = areas.map((area) => ({
    id: area.id,
    name: area.name,
    description: area.description,
    status: area.status,
    projects: projects.filter((project) => project.areaId === area.id).length,
    tasks: tasks.filter((task) => task.areaId === area.id).length,
    assets: assets.filter((asset) => asset.areaId === area.id).length,
    ideas: ideas.filter((idea) => idea.areaId === area.id).length,
  }));

  const activeProjects = projects.filter((project) => project.status === "active");
  const openTasks = tasks.filter((task) => !["completed", "discarded"].includes(task.status));
  const activeAssets = assets.filter((asset) => ["active", "pending"].includes(asset.status));

  const settings = {
    counters: {
      users: users.length,
      areas: areas.length,
      activeProjects: activeProjects.length,
      openTasks: openTasks.length,
      activeAssets: activeAssets.length,
      ideasInbox: ideas.filter((idea) => idea.status === "inbox").length,
      boards: boards.length,
      documents: documents.length,
    },
    health: {
      projectsWithoutArea: projects.filter((project) => !project.areaId).length,
      activeProjectsWithoutNextAction: activeProjects.filter((project) => !project.nextAction?.trim()).length,
      openTasksWithoutProject: openTasks.filter((task) => !task.projectId).length,
      activeAssetsWithoutReference: activeAssets.filter((asset) => !asset.url && !asset.passwordManagerReference && !asset.accountEmail && !asset.username).length,
    },
    areas: areaRows,
  };

  return <SettingsView settings={settings} />;
}
