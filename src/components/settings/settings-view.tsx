"use client";

import Link from "next/link";
import { Bell, CheckCircle2, Database, FolderKanban, KeyRound, LayoutGrid, Library, Settings, ShieldCheck, Zap } from "lucide-react";
import { Header, Status } from "@/components/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SettingsPayload = {
  counters: {
    users: number;
    areas: number;
    activeProjects: number;
    openTasks: number;
    activeAssets: number;
    ideasInbox: number;
    boards: number;
    documents: number;
  };
  health: {
    projectsWithoutArea: number;
    activeProjectsWithoutNextAction: number;
    openTasksWithoutProject: number;
    activeAssetsWithoutReference: number;
  };
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

const operatingRules = [
  "Captura rápida es el único punto global de creación.",
  "Las pantallas internas quedan para listar, buscar, filtrar, editar y eliminar.",
  "Nexo registra contexto y referencias; no guarda contraseñas, tokens ni claves privadas.",
  "Alertas funciona como centro de señales, no como módulo duplicado de vencimientos.",
];

export function SettingsView({ settings }: { settings: SettingsPayload }) {
  const healthRows = [
    ["Proyectos sin área", settings.health.projectsWithoutArea, "/projects"],
    ["Proyectos activos sin próxima acción", settings.health.activeProjectsWithoutNextAction, "/projects"],
    ["Tareas abiertas sin proyecto", settings.health.openTasksWithoutProject, "/tasks"],
    ["Activos sin referencia de acceso", settings.health.activeAssetsWithoutReference, "/assets"],
  ] as const;

  return (
    <>
      <Header title="Configuración" desc="Estado de estructura, reglas operativas y consistencia general de Nexo." />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Settings} title="Entorno" value="Local" subtitle="Modo de uso personal" />
        <SummaryCard icon={Database} title="Datos base" value={settings.counters.areas} subtitle="Áreas configuradas" />
        <SummaryCard icon={ShieldCheck} title="Seguridad" value="OK" subtitle="Secretos fuera de Nexo" />
        <SummaryCard icon={Zap} title="Creación" value="Global" subtitle="Captura rápida centralizada" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="size-4" />Módulos activos</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {activeModules.map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50">
                <span>{label}</span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4" />Reglas operativas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {operatingRules.map((rule) => (
              <div key={rule} className="flex gap-3 rounded-lg border bg-white p-3 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p>{rule}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="size-4" />Consistencia de datos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {healthRows.map(([label, value, href]) => (
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

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FolderKanban className="size-4" />Resumen operativo</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Usuarios" value={settings.counters.users} />
            <MiniMetric label="Proyectos activos" value={settings.counters.activeProjects} />
            <MiniMetric label="Tareas abiertas" value={settings.counters.openTasks} />
            <MiniMetric label="Activos vigentes" value={settings.counters.activeAssets} />
            <MiniMetric label="Ideas en inbox" value={settings.counters.ideasInbox} />
            <MiniMetric label="Pizarras" value={settings.counters.boards} />
            <MiniMetric label="Documentos" value={settings.counters.documents} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Library className="size-4" />Áreas de trabajo</CardTitle></CardHeader>
        <CardContent>
          {settings.areas.length ? (
            <div className="space-y-3">
              {settings.areas.map((area) => (
                <div key={area.id} className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{area.name}</p>
                      <Status value={area.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{area.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{area.projects} proyectos</span>
                    <span>·</span>
                    <span>{area.tasks} tareas</span>
                    <span>·</span>
                    <span>{area.assets} activos</span>
                    <span>·</span>
                    <span>{area.ideas} ideas</span>
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

function SummaryCard({ icon: Icon, title, value, subtitle }: { icon: any; title: string; value: number | string; subtitle: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="size-5" /></div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-3"><p className="text-2xl font-semibold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>;
}
