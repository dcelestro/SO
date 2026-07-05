"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FolderKanban,
  HardDriveDownload,
  KeyRound,
  PlugZap,
  ServerCog,
  ShieldAlert,
  Terminal,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SettingsPayload = {
  system: {
    appName: string;
    appVersion: string;
    nodeVersion: string;
    nodeEnv: string;
    authEnabled: boolean;
    authSecretConfigured: boolean;
    nextVersion: string;
    prismaVersion: string;
  };
  database: {
    connected: boolean;
    provider: string;
    host: string;
    port: string;
    database: string;
    user: string;
    size: string;
    version: string;
    urlConfigured: boolean;
  };
  backups: {
    provider: string;
    destination: string;
    automatic: boolean;
    lastBackup: string;
    retention: string;
  };
  counters: {
    users: number;
    areas: number;
    projects: number;
    activeProjects: number;
    openTasks: number;
    assets: number;
    activeAssets: number;
    ideas: number;
    activeAlerts: number;
    boards: number;
    documents: number;
  };
  consistency: {
    projectsWithoutArea: number;
    activeProjectsWithoutNextAction: number;
    openTasksWithoutProject: number;
    activeAssetsWithoutReference: number;
    ideasWithoutArea: number;
  };
  connections: Array<{ name: string; status: string; detail: string }>;
  areas: Array<{
    id: string;
    name: string;
    description?: string | null;
    status: string;
    projects: number;
    tasks: number;
    assets: number;
    ideas: number;
  }>;
};

const commands = [
  { label: "Abrir consola Prisma", command: "npm run db:studio", note: "Explorar tablas y registros manualmente." },
  { label: "Ver estado de migraciones", command: "npx prisma migrate status", note: "Confirmar si la base está sincronizada." },
  { label: "Generar cliente Prisma", command: "npm run db:generate", note: "Actualizar cliente después de cambios de schema." },
  { label: "Aplicar migraciones dev", command: "npm run db:migrate", note: "Solo en desarrollo controlado." },
  { label: "Backup PostgreSQL", command: "pg_dump $env:DATABASE_URL > backups/nexo_backup.sql", note: "Crear copia SQL local desde PowerShell." },
  { label: "Restaurar PostgreSQL", command: "psql $env:DATABASE_URL < backups/nexo_backup.sql", note: "Usar solo con backup verificado." },
];

const activeModules = [
  ["Inicio", "/dashboard"],
  ["Tareas", "/tasks"],
  ["Proyectos", "/projects"],
  ["Ideas", "/ideas"],
  ["Activos", "/assets"],
  ["Alertas", "/alerts"],
  ["KPIs", "/kpis"],
  ["Biblioteca", "/library"],
  ["Pizarras", "/boards"],
];

export function SettingsView({ settings }: { settings: SettingsPayload }) {
  const consistencyRows = [
    ["Proyectos sin área", settings.consistency.projectsWithoutArea, "/projects"],
    ["Proyectos activos sin próxima acción", settings.consistency.activeProjectsWithoutNextAction, "/projects"],
    ["Tareas abiertas sin proyecto", settings.consistency.openTasksWithoutProject, "/tasks"],
    ["Activos sin referencia de acceso", settings.consistency.activeAssetsWithoutReference, "/assets"],
    ["Ideas sin área", settings.consistency.ideasWithoutArea, "/ideas"],
  ] as const;

  return (
    <>
      <Header
        title="Centro técnico"
        desc="Configuración operativa de la app: base de datos, backups, conexiones, mantenimiento y salud del sistema."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard icon={Database} title="Base de datos" value={settings.database.connected ? "Conectada" : "Error"} subtitle={`${settings.database.provider} · ${settings.database.database}`} status={settings.database.connected ? "ok" : "danger"} />
        <StatusCard icon={HardDriveDownload} title="Backups" value={settings.backups.automatic ? "Automático" : "Pendiente"} subtitle={settings.backups.destination} status={settings.backups.automatic ? "ok" : "warning"} />
        <StatusCard icon={KeyRound} title="Autenticación" value={settings.system.authEnabled ? "Activa" : "Dev off"} subtitle={settings.system.authSecretConfigured ? "AUTH_SECRET configurado" : "Secret local por defecto"} status={settings.system.authEnabled && !settings.system.authSecretConfigured ? "warning" : "ok"} />
        <StatusCard icon={Activity} title="Salud operativa" value={`${settings.counters.activeAlerts}`} subtitle="Alertas activas" status={settings.counters.activeAlerts ? "warning" : "ok"} />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="size-4" />Base de datos</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Info label="Proveedor" value={settings.database.provider} />
            <Info label="Host" value={`${settings.database.host}:${settings.database.port}`} />
            <Info label="Base" value={settings.database.database} />
            <Info label="Usuario" value={settings.database.user} />
            <Info label="Tamaño" value={settings.database.size} />
            <Info label="Versión" value={settings.database.version} wide />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ServerCog className="size-4" />Runtime</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Info label="App" value={settings.system.appName} />
            <Info label="Versión" value={settings.system.appVersion} />
            <Info label="Entorno" value={settings.system.nodeEnv} />
            <Info label="Node" value={settings.system.nodeVersion} />
            <Info label="Next.js" value={settings.system.nextVersion} />
            <Info label="Prisma" value={settings.system.prismaVersion} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><HardDriveDownload className="size-4" />Backups</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Info label="Proveedor" value={settings.backups.provider} />
            <Info label="Destino" value={settings.backups.destination} />
            <Info label="Último backup" value={settings.backups.lastBackup} />
            <Info label="Retención" value={settings.backups.retention} />
            <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-800">
              Próximo paso técnico: conectar acciones reales para crear backup, descargar backup y restaurar desde backup con confirmación fuerte.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PlugZap className="size-4" />Conexiones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settings.connections.map((connection) => (
              <div key={connection.name} className="flex items-start justify-between gap-3 rounded-lg border bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{connection.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{connection.detail}</p>
                </div>
                <Pill status={connection.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Terminal className="size-4" />Mantenimiento y base de datos</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {commands.map((item) => (
              <div key={item.command} className="rounded-lg border bg-white p-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <code className="mt-2 block overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-50">{item.command}</code>
                <p className="mt-2 text-xs text-slate-500">{item.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="size-4" />Consistencia de datos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {consistencyRows.map(([label, value, href]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">Objetivo: 0</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-semibold ${value ? "text-red-600" : "text-emerald-700"}`}>{value}</p>
                  <Button asChild variant="outline" size="sm"><Link href={href}>Ver</Link></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FolderKanban className="size-4" />Volumen de datos</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Usuarios" value={settings.counters.users} />
            <MiniMetric label="Áreas" value={settings.counters.areas} />
            <MiniMetric label="Proyectos" value={settings.counters.projects} />
            <MiniMetric label="Tareas abiertas" value={settings.counters.openTasks} />
            <MiniMetric label="Activos" value={settings.counters.assets} />
            <MiniMetric label="Ideas" value={settings.counters.ideas} />
            <MiniMetric label="Pizarras" value={settings.counters.boards} />
            <MiniMetric label="Documentos" value={settings.counters.documents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ServerCog className="size-4" />Módulos activos</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {activeModules.map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50">
                <span>{label}</span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="size-4" />Áreas de trabajo</CardTitle></CardHeader>
        <CardContent>
          {settings.areas.length ? (
            <div className="space-y-3">
              {settings.areas.map((area) => (
                <div key={area.id} className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{area.name}</p>
                      <Pill status={area.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{area.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{area.projects} proyectos</span><span>·</span><span>{area.tasks} tareas</span><span>·</span><span>{area.assets} activos</span><span>·</span><span>{area.ideas} ideas</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No hay áreas configuradas.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatusCard({ icon: Icon, title, value, subtitle, status }: { icon: any; title: string; value: string; subtitle: string; status: "ok" | "warning" | "danger" }) {
  const iconClass = status === "ok" ? "text-emerald-700" : status === "warning" ? "text-amber-700" : "text-red-700";
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-slate-100"><Icon className={`size-5 ${iconClass}`} /></div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value, wide }: { label: string; value: string | number; wide?: boolean }) {
  return <div className={`rounded-lg border bg-white p-3 ${wide ? "sm:col-span-2" : ""}`}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p></div>;
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-3"><p className="text-2xl font-semibold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>;
}

function Pill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const Icon = ["connected", "enabled", "active", "ok"].includes(normalized) ? CheckCircle2 : ["pending", "disabled", "external", "paused"].includes(normalized) ? Clock3 : normalized === "error" ? XCircle : AlertTriangle;
  const tone = ["connected", "enabled", "active", "ok"].includes(normalized) ? "bg-emerald-50 text-emerald-700" : ["pending", "disabled", "external", "paused"].includes(normalized) ? "bg-amber-50 text-amber-700" : normalized === "error" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${tone}`}><Icon className="size-3" />{status}</span>;
}
