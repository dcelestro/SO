import { SettingsView } from "@/components/settings/settings-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DbProbe = {
  database_name: string;
  database_user: string;
  database_size_bytes: bigint | number | string;
  version: string;
};

function mask(value?: string | null) {
  if (!value) return "No configurado";
  if (value.length <= 8) return "Configurado";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function parseDatabaseUrl(value?: string) {
  if (!value) {
    return {
      configured: false,
      provider: "No configurado",
      host: "No configurado",
      port: "-",
      database: "No configurado",
      user: "No configurado",
    };
  }

  try {
    const url = new URL(value);
    return {
      configured: true,
      provider: url.protocol.replace(":", "") || "PostgreSQL",
      host: url.hostname || "No disponible",
      port: url.port || "default",
      database: url.pathname.replace("/", "") || "No disponible",
      user: url.username || "No disponible",
    };
  } catch {
    return {
      configured: true,
      provider: "Formato no reconocido",
      host: "No disponible",
      port: "-",
      database: "No disponible",
      user: "No disponible",
    };
  }
}

function formatBytes(value: bigint | number | string | null | undefined) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "No disponible";
  const units = ["B", "KB", "MB", "GB"];
  let amount = bytes;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount = amount / 1024;
    index += 1;
  }
  return `${amount.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default async function SettingsPage() {
  const prisma = getPrisma();
  const databaseUrl = parseDatabaseUrl(process.env.DATABASE_URL);

  const [probe, areas, projects, tasks, assets, ideas, alerts, boards, documents, users] = await Promise.all([
    prisma.$queryRaw<DbProbe[]>`select current_database() as database_name, current_user as database_user, pg_database_size(current_database()) as database_size_bytes, version() as version`,
    prisma.area.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.digitalAsset.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.idea.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.alert.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.board.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.document.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const db = probe[0];
  const openTasks = tasks.filter((task) => !["completed", "discarded"].includes(task.status));
  const activeProjects = projects.filter((project) => project.status === "active");
  const activeAssets = assets.filter((asset) => ["active", "pending"].includes(asset.status));
  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const settings = {
    system: {
      appName: "nexo-control-personal",
      appVersion: "0.1.0",
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV || "development",
      authEnabled: process.env.AUTH_ENABLED === "true",
      authSecretConfigured: Boolean(process.env.AUTH_SECRET),
      nextVersion: "16.2.9",
      prismaVersion: "6.19.1",
    },
    database: {
      connected: Boolean(db),
      provider: databaseUrl.provider,
      host: databaseUrl.host,
      port: databaseUrl.port,
      database: db?.database_name || databaseUrl.database,
      user: db?.database_user || databaseUrl.user,
      size: formatBytes(db?.database_size_bytes),
      version: db?.version?.split(" on ")[0] || "No disponible",
      urlConfigured: databaseUrl.configured,
    },
    backups: {
      provider: process.env.BACKUP_PROVIDER || "No configurado",
      destination: process.env.BACKUP_DESTINATION ? mask(process.env.BACKUP_DESTINATION) : process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID ? mask(process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID) : "No configurado",
      automatic: process.env.BACKUP_ENABLED === "true",
      lastBackup: process.env.LAST_BACKUP_AT || "No registrado",
      retention: process.env.BACKUP_RETENTION_DAYS || "No configurado",
    },
    counters: {
      users: users.length,
      areas: areas.length,
      projects: projects.length,
      activeProjects: activeProjects.length,
      openTasks: openTasks.length,
      assets: assets.length,
      activeAssets: activeAssets.length,
      ideas: ideas.length,
      activeAlerts: activeAlerts.length,
      boards: boards.length,
      documents: documents.length,
    },
    consistency: {
      projectsWithoutArea: projects.filter((project) => !project.areaId).length,
      activeProjectsWithoutNextAction: activeProjects.filter((project) => !project.nextAction?.trim()).length,
      openTasksWithoutProject: openTasks.filter((task) => !task.projectId).length,
      activeAssetsWithoutReference: activeAssets.filter((asset) => !asset.url && !asset.passwordManagerReference && !asset.accountEmail && !asset.username).length,
      ideasWithoutArea: ideas.filter((idea) => !idea.areaId).length,
    },
    connections: [
      { name: "PostgreSQL", status: Boolean(db) ? "connected" : "error", detail: `${databaseUrl.host}/${db?.database_name || databaseUrl.database}` },
      { name: "Prisma ORM", status: "connected", detail: "Cliente generado por @prisma/client" },
      { name: "Autenticación local", status: process.env.AUTH_ENABLED === "true" ? "enabled" : "disabled", detail: process.env.AUTH_ENABLED === "true" ? "Protegida por sesión" : "Desactivada para desarrollo" },
      { name: "Gestor de secretos", status: "external", detail: "Nexo solo guarda referencias; La Caja queda fuera de este módulo" },
      { name: "Backup remoto", status: process.env.BACKUP_ENABLED === "true" ? "enabled" : "pending", detail: process.env.BACKUP_ENABLED === "true" ? "Configurado por variables de entorno" : "Pendiente de configurar" },
    ],
    areas: areas.map((area) => ({
      id: area.id,
      name: area.name,
      description: area.description,
      status: area.status,
      projects: projects.filter((project) => project.areaId === area.id).length,
      tasks: tasks.filter((task) => task.areaId === area.id).length,
      assets: assets.filter((asset) => asset.areaId === area.id).length,
      ideas: ideas.filter((idea) => idea.areaId === area.id).length,
    })),
  };

  return <SettingsView settings={settings} />;
}
