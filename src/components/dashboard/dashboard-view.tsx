"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Folder,
  Lock,
  ShieldAlert,
  Target,
  Zap,
} from "lucide-react";
import type { DashboardKpi, DashboardRadar, DashboardRadarItem, DashboardSeverity } from "@/lib/dashboard-radar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, TextWithLinks, fmt } from "@/components/workspace";

const severityLabel: Record<DashboardSeverity, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
  info: "Info",
};

const severityStyles: Record<DashboardSeverity, { badge: string; row: string; dot: string; tint: string; text: string; border: string }> = {
  critical: {
    badge: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
    row: "border-red-200 bg-red-50/75 hover:bg-red-50",
    dot: "bg-red-500",
    tint: "bg-red-50 text-red-700 ring-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  high: {
    badge: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
    row: "border-orange-200 bg-orange-50/70 hover:bg-orange-50",
    dot: "bg-orange-500",
    tint: "bg-orange-50 text-orange-700 ring-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  medium: {
    badge: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
    row: "border-blue-200 bg-blue-50/60 hover:bg-blue-50",
    dot: "bg-blue-500",
    tint: "bg-blue-50 text-blue-700 ring-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  low: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    row: "border-emerald-200 bg-emerald-50/55 hover:bg-emerald-50",
    dot: "bg-emerald-500",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  info: {
    badge: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50",
    row: "border-slate-200 bg-white hover:bg-slate-50",
    dot: "bg-slate-400",
    tint: "bg-slate-50 text-slate-600 ring-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

type PanelAccent = DashboardSeverity | "indigo" | "violet" | "slate";

const panelAccentStyles: Record<PanelAccent, string> = {
  critical: "border-t-red-400",
  high: "border-t-orange-400",
  medium: "border-t-blue-400",
  low: "border-t-emerald-400",
  info: "border-t-slate-300",
  indigo: "border-t-indigo-400",
  violet: "border-t-violet-400",
  slate: "border-t-slate-400",
};

const sideAccentStyles: Record<DashboardSeverity, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-blue-500",
  low: "border-l-emerald-500",
  info: "border-l-slate-400",
};

const kindLabels: Record<DashboardRadarItem["kind"], string> = {
  task: "Tarea",
  project: "Proyecto",
  asset: "Activo",
  idea: "Idea",
  alert: "Alerta",
};

const kpiIcons: ComponentType<{ className?: string }>[] = [ClipboardList, Lock, Bell, Folder, ShieldAlert];

export function DashboardView({ radar }: { radar: DashboardRadar }) {
  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#edf1f5]">
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="space-y-5">
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
            <HeroIssue item={radar.heroIssue} />
            <KpiConsole kpis={radar.kpis} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.9fr)_minmax(380px,0.95fr)]">
            <RadarPanel title="Prioritario" count={radar.priorityItems.length} actionHref="/tasks" actionLabel="Ver todo" accent="critical">
              <ItemList items={radar.priorityItems.slice(0, 6)} empty="No hay señales críticas o altas abiertas." />
            </RadarPanel>
            <RadarPanel title="Hoy" count={radar.todayItems.length} actionHref="/tasks" actionLabel="Ver agenda" accent="medium">
              <ItemList items={radar.todayItems.slice(0, 5)} empty="Nada venciendo hoy. Buen momento para avanzar." compact />
            </RadarPanel>
            <RadarPanel title="Trabado / esperando" count={radar.waitingItems.length} actionHref="/projects" actionLabel="Ver bloqueos" accent="high">
              <ItemList items={radar.waitingItems.slice(0, 5)} empty="No hay bloqueos ni esperas activas." compact />
              {radar.waitingItems.length ? (
                <Link href="/projects" className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-700 hover:bg-blue-100">
                  <span>{radar.waitingItems.length} señal{radar.waitingItems.length === 1 ? "" : "es"} deteniendo avance</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </RadarPanel>
            <div className="space-y-4">
              <RadarPanel title="Próximas señales" count={radar.upcomingSignals.length} actionHref="/alerts" actionLabel="Ver todas" accent="indigo">
                <ItemList items={radar.upcomingSignals.slice(0, 5)} empty="Sin señales próximas en el horizonte." compact />
              </RadarPanel>
              <OperationalCalendar items={radar.calendarItems} />
            </div>
          </section>

          <LastProgressCard progress={radar.lastProgress} />
        </div>
      </div>
    </div>
  );
}

function HeroIssue({ item }: { item: DashboardRadarItem | null }) {
  if (!item) {
    return (
      <Card className="overflow-hidden border border-emerald-200 border-t-4 border-t-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm ring-1 ring-emerald-100/60">
        <CardContent className="flex min-h-[220px] flex-col justify-between p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Todo bajo control
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">No hay señales urgentes abiertas.</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">El radar no detectó bloqueos, vencimientos críticos ni alertas altas.</p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-xl">
            <Link href="/tasks">Revisar tareas</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border border-slate-200 border-l-4 ${sideAccentStyles[item.severity]} bg-gradient-to-br from-white via-white to-slate-50 shadow-sm ring-1 ring-slate-200/70`}>
      <CardContent className="relative flex min-h-[260px] flex-col justify-between p-6">
        <div className={`absolute right-6 top-7 grid size-20 place-items-center rounded-full ring-1 ${severityStyles[item.severity].tint}`}>
          <Zap className="size-9" />
        </div>
        <div className="pr-24">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950"><TextWithLinks value={item.title} /></h2>
            <SeverityBadge severity={item.severity} />
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">{kindLabels[item.kind]} · {item.subtitle}{item.meta ? ` · ${item.meta}` : ""}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{item.description || "Esta señal concentra el mayor riesgo operativo detectado por Nexo en este momento."}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl bg-slate-950 px-5 font-semibold hover:bg-slate-800">
            <Link href={item.href}>{item.cta}<ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/alerts">Ver radar completo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiConsole({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="p-0">
        <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
          {kpis.map((kpi, index) => {
            const Icon = kpiIcons[index] || ClipboardList;
            return <KpiTile key={kpi.label} kpi={kpi} icon={Icon} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiTile({ kpi, icon: Icon }: { kpi: DashboardKpi; icon: ComponentType<{ className?: string }> }) {
  const style = severityStyles[kpi.severity];
  return (
    <Link href={kpi.href} className={`group block border-t-4 ${panelAccentStyles[kpi.severity]} bg-white p-5 transition hover:bg-slate-50`}>
      <div className={`mb-4 grid size-9 place-items-center rounded-xl ring-1 ${style.tint}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${style.text}`}>{kpi.value}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span className="line-clamp-2">{kpi.detail}</span>
        <ArrowRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function RadarPanel({ title, count, actionHref, actionLabel, accent = "slate", children }: { title: string; count?: number; actionHref?: string; actionLabel?: string; accent?: PanelAccent; children: ReactNode }) {
  return (
    <Card className={`overflow-hidden border border-slate-200 border-t-4 ${panelAccentStyles[accent]} bg-white shadow-sm ring-1 ring-slate-200/70`}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {typeof count === "number" ? <Badge variant="outline" className="rounded-full bg-slate-50">{count}</Badge> : null}
        </div>
        {actionHref && actionLabel ? (
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-xs text-slate-500 hover:text-slate-950">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function ItemList({ items, empty, compact = false }: { items: DashboardRadarItem[]; empty: string; compact?: boolean }) {
  return <div className="space-y-2">{items.length ? items.map((item) => <DashboardItemRow key={item.id} item={item} compact={compact} />) : <Empty text={empty} />}</div>;
}

function DashboardItemRow({ item, compact }: { item: DashboardRadarItem; compact?: boolean }) {
  const style = severityStyles[item.severity];
  return (
    <Link href={item.href} className={`group flex items-center gap-3 rounded-xl border px-3 ${compact ? "py-2.5" : "py-3"} transition ${style.row}`}>
      <span className={`mt-1 size-2.5 shrink-0 rounded-full ${style.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={item.title} /></p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{kindLabels[item.kind]} · {item.subtitle}{item.meta ? ` · ${item.meta}` : ""}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-2 2xl:flex">
        <SeverityBadge severity={item.severity} />
      </div>
      <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
    </Link>
  );
}

function SeverityBadge({ severity }: { severity: DashboardSeverity }) {
  return <Badge variant="outline" className={`rounded-full ${severityStyles[severity].badge}`}>{severityLabel[severity]}</Badge>;
}

function LastProgressCard({ progress }: { progress: DashboardRadar["lastProgress"] }) {
  return (
    <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-blue-400 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Target className="size-4" />
          </div>
          <CardTitle className="text-base">Último avance / dónde quedé</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {progress ? (
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_1.1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Último frente</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{progress.projectName}</p>
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                <Link href={progress.projectHref}>Abrir proyecto</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Última acción</p>
              <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{progress.action}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{progress.description}</p>
              <p className="mt-2 text-xs text-slate-400">{fmt(progress.when)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Siguiente paso sugerido</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{progress.nextStep}</p>
              <Button asChild className="mt-3 rounded-xl bg-slate-950 hover:bg-slate-800">
                <Link href={progress.nextHref}>Continuar<ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-700 ring-1 ring-blue-100">
              <Clock3 className="mb-3 size-5" />
              <p className="text-sm font-semibold">Nexo reconstruyó tu contexto.</p>
              <p className="mt-1 text-xs leading-5 text-blue-600">Esta tarjeta sale del registro de actividad, no de carga manual.</p>
            </div>
          </div>
        ) : (
          <Empty text="Todavía no hay actividad suficiente para reconstruir dónde quedaste." />
        )}
      </CardContent>
    </Card>
  );
}

const TODAY = Date.now();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function OperationalCalendar({ items }: { items: DashboardRadarItem[] }) {
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date(TODAY)));
  const monthDate = new Date(TODAY);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [...Array.from({ length: startOffset }, () => null), ...Array.from({ length: last.getDate() }, (_, index) => new Date(year, month, index + 1))];
  while (cells.length % 7 !== 0) cells.push(null);

  const itemsByDate = new Map<string, DashboardRadarItem[]>();
  for (const item of items) {
    if (!item.date) continue;
    const key = dateKey(new Date(item.date));
    itemsByDate.set(key, [...(itemsByDate.get(key) || []), item]);
  }
  const selectedItems = itemsByDate.get(selectedDate) || [];

  return (
    <RadarPanel title="Calendario operativo" count={items.length} actionHref="/tasks" actionLabel="Ver agenda" accent="slate">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold capitalize text-slate-900">{new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(monthDate)}</p>
        <div className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="size-3.5" /> señales</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <div key={`${day}-${index}`} className="py-1">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const key = cell ? dateKey(cell) : `empty-${index}`;
          const dayItems = cell ? itemsByDate.get(dateKey(cell)) || [] : [];
          const isToday = cell && dateKey(cell) === dateKey(new Date(TODAY));
          const selected = cell && dateKey(cell) === selectedDate;
          const maxSeverity = getMaxSeverity(dayItems);
          return (
            <button key={key} type="button" disabled={!cell} onClick={() => cell && setSelectedDate(dateKey(cell))} className={`relative h-10 rounded-lg border text-xs transition ${!cell ? "border-transparent bg-transparent" : selected ? "border-slate-950 bg-slate-950 text-white" : isToday ? "border-amber-300 bg-amber-50 text-slate-950" : dayItems.length ? "border-slate-200 bg-white hover:border-slate-400" : "border-slate-100 bg-white hover:border-slate-300"}`}>
              {cell ? cell.getDate() : ""}
              {dayItems.length ? (
                <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {dayItems.slice(0, 3).map((item) => <span key={item.id} className={`size-1.5 rounded-full ${severityStyles[item.severity].dot}`} />)}
                  {dayItems.length > 3 ? <span className={`size-1.5 rounded-full ${severityStyles[maxSeverity].dot}`} /> : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2">
        {selectedItems.length ? selectedItems.slice(0, 4).map((item) => (
          <Link key={item.id} href={item.href} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${severityStyles[item.severity].row}`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="text-xs text-slate-500">{kindLabels[item.kind]} · {item.meta || fmt(item.date)}</p>
            </div>
            <SeverityBadge severity={item.severity} />
          </Link>
        )) : <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-500">Sin elementos para ese día.</p>}
      </div>
    </RadarPanel>
  );
}

function getMaxSeverity(items: DashboardRadarItem[]): DashboardSeverity {
  return items.reduce<DashboardSeverity>((current, item) => (severityWeight(item.severity) > severityWeight(current) ? item.severity : current), "info");
}

function severityWeight(severity: DashboardSeverity) {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  if (severity === "low") return 1;
  return 0;
}
