"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Target, Zap } from "lucide-react";
import type { DashboardRadar, DashboardRadarItem, DashboardSeverity } from "@/lib/dashboard-radar";
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

const severity = {
  critical: { dot: "bg-red-500", row: "border-red-200 bg-red-50/70", badge: "border-red-200 bg-red-50 text-red-700", text: "text-red-700", rail: "border-l-red-500", tint: "bg-red-50 text-red-700 ring-red-100" },
  high: { dot: "bg-orange-500", row: "border-orange-200 bg-orange-50/70", badge: "border-orange-200 bg-orange-50 text-orange-700", text: "text-orange-700", rail: "border-l-orange-500", tint: "bg-orange-50 text-orange-700 ring-orange-100" },
  medium: { dot: "bg-blue-500", row: "border-blue-200 bg-blue-50/60", badge: "border-blue-200 bg-blue-50 text-blue-700", text: "text-blue-700", rail: "border-l-blue-500", tint: "bg-blue-50 text-blue-700 ring-blue-100" },
  low: { dot: "bg-emerald-500", row: "border-emerald-200 bg-emerald-50/55", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", text: "text-emerald-700", rail: "border-l-emerald-500", tint: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  info: { dot: "bg-slate-400", row: "border-slate-200 bg-white", badge: "border-slate-200 bg-slate-50 text-slate-600", text: "text-slate-700", rail: "border-l-slate-400", tint: "bg-slate-50 text-slate-600 ring-slate-100" },
} satisfies Record<DashboardSeverity, Record<string, string>>;

const kindLabels: Record<DashboardRadarItem["kind"], string> = {
  task: "Tarea",
  project: "Proyecto",
  asset: "Activo",
  idea: "Idea",
  alert: "Alerta",
};

export function DashboardView({ radar }: { radar: DashboardRadar }) {
  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-7">
        <div className="space-y-3">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
              <Hero item={radar.heroIssue} />
              <div className="grid border-t border-slate-100 sm:grid-cols-5 lg:border-l lg:border-t-0">
                {radar.kpis.map((kpi) => (
                  <Link key={kpi.label} href={kpi.href} className="group flex items-center gap-2 border-r border-slate-100 px-3 py-3 last:border-r-0 hover:bg-slate-50">
                    <span className={`size-2 rounded-full ${severity[kpi.severity].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-slate-500">{kpi.label}</span>
                      <span className={`block text-xl font-semibold leading-6 ${severity[kpi.severity].text}`}>{kpi.value}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.9fr)_minmax(360px,0.95fr)]">
            <Panel title="Prioritario" count={radar.priorityItems.length} href="/tasks" accent="critical">
              <ItemList items={radar.priorityItems.slice(0, 6)} empty="No hay señales críticas o altas abiertas." />
            </Panel>
            <Panel title="Hoy" count={radar.todayItems.length} href="/tasks" accent="medium">
              <ItemList items={radar.todayItems.slice(0, 5)} empty="Nada venciendo hoy." />
            </Panel>
            <Panel title="Trabado / esperando" count={radar.waitingItems.length} href="/projects" accent="high">
              <ItemList items={radar.waitingItems.slice(0, 5)} empty="No hay bloqueos ni esperas activas." />
            </Panel>
            <div className="space-y-3">
              <Panel title="Próximas señales" count={radar.upcomingSignals.length} href="/alerts" accent="info">
                <ItemList items={radar.upcomingSignals.slice(0, 5)} empty="Sin señales próximas." />
              </Panel>
              <OperationalCalendar items={radar.calendarItems} />
            </div>
          </section>

          <LastProgress progress={radar.lastProgress} />
        </div>
      </div>
    </div>
  );
}

function Hero({ item }: { item: DashboardRadarItem | null }) {
  if (!item) {
    return (
      <div className="border-l-4 border-l-emerald-500 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><CheckCircle2 className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-950">Todo bajo control</h2>
            <p className="truncate text-sm text-slate-500">No hay bloqueos, vencimientos críticos ni alertas altas.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-lg"><Link href="/tasks">Tareas</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-l-4 ${severity[item.severity].rail} p-4`}>
      <div className="flex items-center gap-3">
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ${severity[item.severity].tint}`}><Zap className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-slate-950"><TextWithLinks value={item.title} /></h2>
            <SeverityBadge value={item.severity} />
          </div>
          <p className="truncate text-sm text-slate-500">{kindLabels[item.kind]} · {item.subtitle}{item.meta ? ` · ${item.meta}` : ""}</p>
          {item.description ? <p className="line-clamp-1 text-sm text-slate-600">{item.description}</p> : null}
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-lg bg-slate-950 hover:bg-slate-800"><Link href={item.href}>{item.cta}</Link></Button>
      </div>
    </div>
  );
}

function Panel({ title, count, href, accent, children }: { title: string; count: number; href: string; accent: DashboardSeverity; children: React.ReactNode }) {
  return (
    <Card className={`overflow-hidden border border-l-4 ${severity[accent].rail} border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70`}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-slate-100 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitle className="truncate text-sm">{title}</CardTitle>
          <Badge variant="outline" className="h-5 rounded-full bg-slate-50 px-2 text-[11px]">{count}</Badge>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-7 rounded-md px-2 text-xs text-slate-500 hover:text-slate-950"><Link href={href}>Ver</Link></Button>
      </CardHeader>
      <CardContent className="p-2.5">{children}</CardContent>
    </Card>
  );
}

function ItemList({ items, empty }: { items: DashboardRadarItem[]; empty: string }) {
  return <div className="space-y-1.5">{items.length ? items.map((item) => <ItemRow key={item.id} item={item} />) : <Empty text={empty} />}</div>;
}

function ItemRow({ item }: { item: DashboardRadarItem }) {
  return (
    <Link href={item.href} className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition ${severity[item.severity].row}`}>
      <span className={`size-2 shrink-0 rounded-full ${severity[item.severity].dot}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-950"><TextWithLinks value={item.title} /></span>
        <span className="block truncate text-xs text-slate-500">{kindLabels[item.kind]} · {item.subtitle}{item.meta ? ` · ${item.meta}` : ""}</span>
      </span>
      <SeverityBadge value={item.severity} />
    </Link>
  );
}

function SeverityBadge({ value }: { value: DashboardSeverity }) {
  return <Badge variant="outline" className={`h-5 rounded-full px-2 text-[11px] ${severity[value].badge}`}>{severityLabel[value]}</Badge>;
}

function LastProgress({ progress }: { progress: DashboardRadar["lastProgress"] }) {
  return (
    <Card className="overflow-hidden border border-l-4 border-l-blue-500 border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><Target className="size-4 text-blue-600" /><CardTitle className="text-sm">Último avance / dónde quedé</CardTitle></div></CardHeader>
      <CardContent className="p-3">
        {progress ? (
          <div className="grid gap-3 text-sm lg:grid-cols-[0.75fr_1fr_1.1fr] lg:items-center">
            <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Frente</p><p className="mt-1 truncate font-semibold text-slate-950">{progress.projectName}</p></div>
            <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Última acción</p><p className="mt-1 truncate font-medium capitalize text-slate-950">{progress.action}</p><p className="truncate text-xs text-slate-500">{progress.description}</p></div>
            <div className="flex min-w-0 items-center justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Siguiente paso</p><p className="mt-1 truncate text-slate-600">{progress.nextStep}</p></div><Button asChild size="sm" className="shrink-0 rounded-lg bg-slate-950 hover:bg-slate-800"><Link href={progress.nextHref}>Continuar</Link></Button></div>
          </div>
        ) : <Empty text="Todavía no hay actividad suficiente para reconstruir dónde quedaste." />}
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
  for (const item of items) if (item.date) {
    const key = dateKey(new Date(item.date));
    itemsByDate.set(key, [...(itemsByDate.get(key) || []), item]);
  }
  const selectedItems = itemsByDate.get(selectedDate) || [];

  return (
    <Panel title="Calendario operativo" count={items.length} href="/tasks" accent="info">
      <div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-semibold capitalize text-slate-900">{new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(monthDate)}</p><div className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="size-3.5" /> señales</div></div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">{["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <div key={`${day}-${index}`} className="py-0.5">{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const key = cell ? dateKey(cell) : `empty-${index}`;
          const dayItems = cell ? itemsByDate.get(dateKey(cell)) || [] : [];
          const isToday = cell && dateKey(cell) === dateKey(new Date(TODAY));
          const selected = cell && dateKey(cell) === selectedDate;
          return <button key={key} type="button" disabled={!cell} onClick={() => cell && setSelectedDate(dateKey(cell))} className={`relative h-8 rounded-md border text-[11px] transition ${!cell ? "border-transparent bg-transparent" : selected ? "border-slate-950 bg-slate-950 text-white" : isToday ? "border-amber-300 bg-amber-50 text-slate-950" : dayItems.length ? "border-slate-200 bg-white hover:border-slate-400" : "border-slate-100 bg-white hover:border-slate-300"}`}>{cell ? cell.getDate() : ""}{dayItems.length ? <span className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">{dayItems.slice(0, 3).map((item) => <span key={item.id} className={`size-1 rounded-full ${severity[item.severity].dot}`} />)}</span> : null}</button>;
        })}
      </div>
      <div className="mt-2 space-y-1.5">
        {selectedItems.length ? selectedItems.slice(0, 3).map((item) => <ItemRow key={item.id} item={item} />) : <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-sm text-slate-500">Sin elementos para ese día.</p>}
      </div>
    </Panel>
  );
}
