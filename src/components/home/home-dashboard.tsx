"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Clock3,
  Flame,
  FolderClock,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  HomeAttentionItem,
  HomeBlockedItem,
  HomeColdProject,
  HomeData,
  HomePath,
  HomeSeverity,
} from "@/lib/home-types";

const priorityLabels = { critical: "Crítica", high: "Alta", medium: "Media", low: "Baja" };
const severityClasses: Record<HomeSeverity, string> = {
  critical: "border-rose-400/50 bg-rose-500/30 text-rose-100",
  high: "border-orange-400/50 bg-orange-500/30 text-orange-100",
  warning: "border-amber-400/50 bg-amber-500/30 text-amber-100",
  neutral: "border-slate-400/45 bg-slate-600/40 text-slate-100",
};
const attentionCardClasses: Record<HomeSeverity, string> = {
  critical: "border-rose-500/45 bg-rose-950/75 hover:border-rose-400/70 hover:bg-rose-900/75",
  high: "border-orange-500/35 bg-orange-950/60 hover:border-orange-400/60 hover:bg-orange-900/65",
  warning: "border-amber-500/35 bg-amber-950/60 hover:border-amber-400/60 hover:bg-amber-900/65",
  neutral: "border-slate-500/40 bg-slate-800/85 hover:border-slate-400/60 hover:bg-slate-700/90",
};

function pathText(path: HomePath) {
  return [path.area, path.project, path.module].filter(Boolean).join(" / ");
}

function daysSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
}

function relativeDate(value: string) {
  const days = daysSince(value);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

function WidgetHeader({ icon, eyebrow, title, description, accent }: { icon: ReactNode; eyebrow: string; title: string; description: string; accent: string }) {
  return (
    <header className="flex items-start gap-3 border-b border-white/8 px-4 py-3.5">
      <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-0.5 text-base font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </header>
  );
}

function CompactPositive({ title, description }: { title: string; description: string }) {
  return (
    <div className="m-3 flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-950/80 px-4 py-3.5">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
      <div>
        <p className="text-sm font-semibold text-emerald-100">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-emerald-200/80">{description}</p>
      </div>
    </div>
  );
}

function PulseHero({ data, loading, onRefresh }: { data: HomeData; loading: boolean; onRefresh: () => void }) {
  const hasBlocked = data.pulse.blockedOrWaitingTasks > 0;
  const hasAttention = data.pulse.importantOpenTasks > 0;
  const state = hasBlocked
    ? { label: "Hay bloqueos", summary: `${data.pulse.blockedOrWaitingTasks} dependencias están frenando trabajo ahora.`, badge: "border-rose-300/25 bg-rose-400/10 text-rose-100", glow: "from-rose-500/20" }
    : hasAttention
      ? { label: "Requiere atención", summary: `${data.pulse.importantOpenTasks} focos activos detectados en tus proyectos.`, badge: "border-orange-300/25 bg-orange-400/10 text-orange-100", glow: "from-orange-500/20" }
      : { label: "Sistema estable", summary: "No hay señales críticas que requieran intervención inmediata.", badge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100", glow: "from-emerald-500/20" };
  const metrics = [
    { label: "Atención alta", value: data.pulse.importantOpenTasks, icon: Flame, style: "border-rose-500/45 bg-rose-950/80 text-rose-100", iconStyle: "bg-rose-500/35 text-rose-200" },
    { label: "Bloqueos", value: data.pulse.blockedOrWaitingTasks, icon: Ban, style: "border-amber-500/45 bg-amber-950/80 text-amber-100", iconStyle: "bg-amber-500/35 text-amber-200" },
    { label: "Proyectos fríos", value: data.pulse.coldProjects, icon: FolderClock, style: "border-violet-500/45 bg-violet-950/80 text-violet-100", iconStyle: "bg-violet-500/35 text-violet-200" },
    { label: "Eventos recientes", value: data.pulse.recentEvents, icon: Activity, style: "border-sky-500/45 bg-sky-950/80 text-sky-100", iconStyle: "bg-sky-500/35 text-sky-200" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-black/20">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${state.glow} via-transparent to-sky-500/10`} />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.22em] text-slate-400"><Gauge className="size-4" />Centro de mando</span>
              <Badge variant="outline" className={state.badge}>{state.label}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Nexo hoy</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">{state.summary}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading} className="self-start text-slate-300 hover:bg-white/10 hover:text-white">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Actualizar
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, style, iconStyle }) => (
            <div key={label} className={`flex min-h-20 items-center gap-3 rounded-2xl border px-3.5 py-3 ${style}`}>
              <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconStyle}`}><Icon className="size-4" /></div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold leading-none text-white">{value}</p>
                <p className="mt-1 text-[11px] font-medium leading-tight text-current/70">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AttentionWidget({ items }: { items: HomeAttentionItem[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rose-400/20 bg-black shadow-xl shadow-rose-950/10 ring-1 ring-rose-500/5">
      <WidgetHeader icon={<AlertTriangle className="size-4 text-rose-200" />} eyebrow="Prioridad operativa" title="Atención inmediata" description="Lo que merece una decisión primero." accent="bg-rose-500/15 ring-1 ring-rose-400/20" />
      {items.length === 0 ? <CompactPositive title="No hay focos críticos ahora" description="El sistema no detectó elementos que requieran intervención inmediata." /> : (
        <div className="space-y-2.5 p-3">
          {items.map((item, index) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className={`group grid gap-3 rounded-xl border p-3.5 transition hover:-translate-y-0.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${attentionCardClasses[item.severity]} ${index === 0 ? "shadow-lg shadow-rose-950/30 ring-1 ring-rose-400/15" : ""}`}
            >
              <Badge variant="outline" className={`w-fit uppercase tracking-wide ${severityClasses[item.severity]}`}>{item.reason}</Badge>
              <div className="min-w-0">
                <p className={`${index === 0 ? "text-base" : "text-sm"} font-semibold text-white`}>{item.title}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{pathText(item.path)}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition group-hover:text-white">Abrir <ArrowUpRight className="size-4" /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function BlockedWidget({ items }: { items: HomeBlockedItem[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-amber-400/15 bg-black shadow-lg shadow-black/10">
      <WidgetHeader icon={<Ban className="size-4 text-amber-200" />} eyebrow="Dependencias" title="Trabado / Esperando" description="Trabajo frenado por una respuesta o dependencia." accent="bg-amber-500/15 ring-1 ring-amber-400/15" />
      {items.length === 0 ? <CompactPositive title="Sin bloqueos registrados" description="No hay dependencias frenando trabajo ahora." /> : (
        <div className="space-y-2 p-3">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group block rounded-xl border border-amber-500/35 bg-amber-950/65 px-3.5 py-3 transition hover:border-amber-400/65 hover:bg-amber-900/70">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={item.status === "blocked" ? "border-rose-400/25 bg-rose-500/10 text-rose-200" : "border-amber-400/25 bg-amber-500/10 text-amber-200"}>{item.status === "blocked" ? "Bloqueada" : "En espera"}</Badge>
                <span className="text-[11px] font-medium text-slate-500">Prioridad {priorityLabels[item.priority].toLowerCase()}</span>
                <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="size-3" />{relativeDate(item.updatedAt)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-white">{item.title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{pathText(item.path)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ColdProjectsWidget({ items }: { items: HomeColdProject[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-violet-400/15 bg-black shadow-lg shadow-black/10">
      <WidgetHeader icon={<FolderClock className="size-4 text-violet-200" />} eyebrow="Radar" title="Proyectos fríos" description="Activos sin movimiento durante 14 días." accent="bg-violet-500/15 ring-1 ring-violet-400/15" />
      {items.length === 0 ? <CompactPositive title="Todo sigue en movimiento" description="No hay proyectos activos sin actividad reciente." /> : (
        <div className="space-y-2 p-3">
          {items.map((project) => (
            <Link key={project.id} href={project.href} className="group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-violet-500/35 bg-violet-950/65 p-3 transition hover:border-violet-400/65 hover:bg-violet-900/70">
              <div className="rounded-xl bg-violet-500/30 py-2 text-center ring-1 ring-violet-400/35"><strong className="block text-xl leading-none text-violet-100">{project.daysInactive}</strong><span className="text-[9px] uppercase tracking-wider text-violet-200/80">días</span></div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{project.name}</p><p className="mt-1 truncate text-xs text-slate-500">{project.openTaskCount} tareas abiertas · Último cambio: {project.lastChangeType}</p></div>
              <ArrowUpRight className="size-4 text-slate-600 transition group-hover:text-violet-200" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentActivityWidget({ data }: { data: HomeData }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sky-400/15 bg-black shadow-lg shadow-black/10">
      <WidgetHeader icon={<Activity className="size-4 text-sky-200" />} eyebrow="Contexto" title="Actividad reciente" description="Una línea de tiempo para retomar dónde estabas." accent="bg-sky-500/15 ring-1 ring-sky-400/15" />
      {data.recentActivity.length === 0 ? (
        <div className="px-4 py-5 text-sm text-slate-400">Todavía no hay actividad reciente relevante.</div>
      ) : (
        <div className="grid gap-x-8 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.recentActivity.map((item) => (
            <Link key={item.id} href={item.href} className="group relative border-l border-sky-400/15 py-2.5 pl-4">
              <span className="absolute -left-[5px] top-4 size-2.5 rounded-full border-2 border-slate-900 bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,.08)]" />
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-sky-300/70">{relativeDate(item.createdAt)}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{item.action}</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-100 group-hover:text-sky-100">{item.title}</p>
              <p className="mt-1 truncate text-[11px] text-slate-600">{pathText(item.path)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CommandBoard({ data, loading, onRefresh }: { data: HomeData; loading: boolean; onRefresh: () => void }) {
  return (
    <div className="relative space-y-4">
      <PulseHero data={data} loading={loading} onRefresh={onRefresh} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,.85fr)]">
        <AttentionWidget items={data.attentionItems} />
        <div className="space-y-4">
          <BlockedWidget items={data.blockedItems} />
          <ColdProjectsWidget items={data.coldProjects} />
        </div>
      </div>
      <RecentActivityWidget data={data} />
    </div>
  );
}

export function HomeDashboard() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/home", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error ?? "No se pudo cargar Inicio.");
        return response.json() as Promise<HomeData>;
      })
      .then((payload) => { if (active) setData(payload); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar Inicio."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  function refreshHome() {
    setLoading(true);
    setError("");
    setRefresh((value) => value + 1);
  }

  return (
    <div className="relative -m-4 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f8fa] p-4 text-slate-100 md:-m-7 md:p-7">
      <div className="relative">
        {loading && !data ? (
          <div className="space-y-4" aria-label="Cargando Centro de Mando">
            <div className="h-64 animate-pulse rounded-[28px] bg-slate-800" />
            <div className="grid gap-4 lg:grid-cols-[1.55fr_.85fr]"><div className="h-96 animate-pulse rounded-2xl bg-slate-800" /><div className="h-48 animate-pulse rounded-2xl bg-slate-800" /></div>
          </div>
        ) : error && !data ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-8 text-center text-sm text-rose-100">{error}</div>
        ) : data ? <CommandBoard data={data} loading={loading} onRefresh={refreshHome} /> : null}
      </div>
    </div>
  );
}
