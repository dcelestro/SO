"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CheckSquare2,
  Database,
  Filter,
  FolderKanban,
  Layers3,
  Lightbulb,
  RotateCcw,
  Search,
  ShieldCheck,
  Siren,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Status, TextWithLinks, fmt } from "@/components/workspace";

type Domain = "all" | "tasks" | "projects" | "assets" | "ideas" | "alerts";
type Severity = "critical" | "high" | "medium" | "low" | "info";
type WindowFilter = "all" | "7" | "14" | "30" | "90";

type AreaRef = { id: string; name: string; status?: string };
type ProjectRef = { id: string; name: string; areaId?: string | null } | null;

type KpiTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  isToday: boolean;
  isCritical: boolean;
  completedAt: string | null;
  updatedAt: string;
  area: AreaRef | null;
  project: ProjectRef;
};

type KpiProject = {
  id: string;
  name: string;
  status: string;
  priority: string;
  maturity: string;
  nextAction: string | null;
  blockedReason: string | null;
  progressPercentage: number;
  targetDate: string | null;
  updatedAt: string;
  area: AreaRef | null;
};

type KpiAsset = {
  id: string;
  name: string;
  type: string;
  provider: string | null;
  status: string;
  renewalDate: string | null;
  updatedAt: string;
  area: AreaRef | null;
  project: ProjectRef;
};

type KpiIdea = {
  id: string;
  title: string;
  status: string;
  origin: string;
  potential: string | null;
  complexity: string | null;
  reviewDate: string | null;
  updatedAt: string;
  area: AreaRef | null;
  project: ProjectRef;
};

type KpiAlert = {
  id: string;
  title: string;
  status: string;
  severity: Severity;
  type: string;
  createdAt: string;
  resolvedAt: string | null;
  area: AreaRef | null;
  project: ProjectRef;
};

type KpisPayload = {
  areas: AreaRef[];
  tasks: KpiTask[];
  projects: KpiProject[];
  assets: KpiAsset[];
  ideas: KpiIdea[];
  alerts: KpiAlert[];
  knowledge: { documents: number; boards: number };
};

type Filters = {
  domain: Domain;
  areaId: string;
  status: string;
  priority: string;
  severity: string;
  window: WindowFilter;
  search: string;
};

type ActionItem = {
  id: string;
  domain: Domain;
  title: string;
  subtitle: string;
  href: string;
  severity: Severity;
  reason: string;
  status: string;
  priority?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  date?: string | null;
  score: number;
};

const DAY = 24 * 60 * 60 * 1000;

const tone = {
  critical: { rail: "border-l-red-500", dot: "bg-red-500", fill: "bg-red-500", soft: "border-red-200 bg-red-50 text-red-700", text: "text-red-700" },
  high: { rail: "border-l-orange-500", dot: "bg-orange-500", fill: "bg-orange-500", soft: "border-orange-200 bg-orange-50 text-orange-700", text: "text-orange-700" },
  medium: { rail: "border-l-blue-500", dot: "bg-blue-500", fill: "bg-blue-500", soft: "border-blue-200 bg-blue-50 text-blue-700", text: "text-blue-700" },
  low: { rail: "border-l-emerald-500", dot: "bg-emerald-500", fill: "bg-emerald-500", soft: "border-emerald-200 bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
  info: { rail: "border-l-slate-400", dot: "bg-slate-400", fill: "bg-slate-300", soft: "border-slate-200 bg-slate-50 text-slate-600", text: "text-slate-700" },
} satisfies Record<Severity, Record<string, string>>;

const severityLabel: Record<Severity, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Medio",
  low: "Bien",
  info: "Info",
};

const defaultFilters: Filters = {
  domain: "all",
  areaId: "all",
  status: "all",
  priority: "all",
  severity: "all",
  window: "30",
  search: "",
};

export function KpisView({ data }: { data: KpisPayload }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const actionItems = useMemo(() => buildActionItems(data), [data]);
  const filteredActions = useMemo(() => actionItems.filter((item) => matchesAction(item, filters)), [actionItems, filters]);
  const scoped = useMemo(() => scopeData(data, filters), [data, filters]);
  const stats = useMemo(() => buildStats(scoped, filteredActions, data.knowledge), [scoped, filteredActions, data.knowledge]);
  const projectRisks = useMemo(() => buildProjectRisks(scoped.projects, scoped.tasks, scoped.alerts, scoped.assets), [scoped]);
  const areaRows = useMemo(() => buildAreaRows(data.areas, scoped), [data.areas, scoped]);
  const status = getGlobalStatus(filteredActions);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-7">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium text-slate-600">KPIs</span>
            <ArrowRight className="size-3.5 text-slate-300" />
            <span className="font-semibold text-slate-950">Centro de mandos</span>
            <Badge variant="outline" className={`ml-1 h-6 rounded-full ${tone[status.tone].soft}`}>{status.label}</Badge>
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <Database className="size-3.5" />
              {filteredActions.length} señales filtradas
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 p-3">
            <FilterBar filters={filters} areas={data.areas} onChange={setFilter} onReset={() => setFilters(defaultFilters)} />
          </div>

          <div className="p-3">
            <CommandStrip stats={stats} status={status} />

            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
              <section className="space-y-3">
                <ChartPanel title="Riesgo por dominio" icon={BarChart3}>
                  <DomainRiskChart items={filteredActions} />
                </ChartPanel>
                <ChartPanel title="Agenda de presión" icon={Target}>
                  <PressureChart actions={filteredActions} />
                </ChartPanel>
              </section>

              <section className="space-y-3">
                <ChartPanel title="Estado de proyectos" icon={FolderKanban}>
                  <ProjectStatusChart projects={scoped.projects} />
                </ChartPanel>
                <ChartPanel title="Flujo de tareas" icon={CheckSquare2}>
                  <TaskFlowChart tasks={scoped.tasks} />
                </ChartPanel>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <ActionQueue items={filteredActions.slice(0, 14)} />
              <ProjectRiskRanking projects={projectRisks.slice(0, 10)} />
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
              <AreaHealthMatrix rows={areaRows} />
              <KnowledgePanel data={data} stats={stats} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterBar({ filters, areas, onChange, onReset }: { filters: Filters; areas: AreaRef[]; onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void; onReset: () => void }) {
  return (
    <div className="grid gap-2 lg:grid-cols-[120px_150px_140px_140px_130px_130px_minmax(220px,1fr)_82px]">
      <FilterSelect label="Dominio" value={filters.domain} onChange={(value) => onChange("domain", value as Domain)} options={[
        ["all", "Todos"], ["tasks", "Tareas"], ["projects", "Proyectos"], ["assets", "Activos"], ["ideas", "Ideas"], ["alerts", "Alertas"],
      ]} />
      <FilterSelect label="Área" value={filters.areaId} onChange={(value) => onChange("areaId", value)} options={[["all", "Todas"], ...areas.map((area) => [area.id, area.name] as [string, string])]} />
      <FilterSelect label="Estado" value={filters.status} onChange={(value) => onChange("status", value)} options={[
        ["all", "Todos"], ["open", "Abierto"], ["active", "Activo"], ["blocked", "Bloqueado"], ["waiting", "En espera"], ["expired", "Vencido"], ["inbox", "Inbox"], ["completed", "Completado"],
      ]} />
      <FilterSelect label="Prioridad" value={filters.priority} onChange={(value) => onChange("priority", value)} options={[["all", "Todas"], ["critical", "Crítica"], ["high", "Alta"], ["medium", "Media"], ["low", "Baja"]]} />
      <FilterSelect label="Severidad" value={filters.severity} onChange={(value) => onChange("severity", value)} options={[["all", "Todas"], ["critical", "Crítica"], ["high", "Alta"], ["medium", "Media"], ["low", "Bien"], ["info", "Info"]]} />
      <FilterSelect label="Horizonte" value={filters.window} onChange={(value) => onChange("window", value as WindowFilter)} options={[["7", "7 días"], ["14", "14 días"], ["30", "30 días"], ["90", "90 días"], ["all", "Todo"]]} />
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Buscar</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder="SQL-like search" className="h-9 rounded-lg bg-white pl-9" />
        </div>
      </div>
      <div className="flex items-end">
        <Button type="button" variant="outline" size="sm" onClick={onReset} className="h-9 w-full rounded-lg"><RotateCcw className="size-3.5" /> Reset</Button>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none transition focus:border-slate-400">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function CommandStrip({ stats, status }: { stats: ReturnType<typeof buildStats>; status: { label: string; tone: Severity; detail: string } }) {
  const items = [
    { title: "Estado general", value: status.label, detail: status.detail, tone: status.tone, href: "/kpis", Icon: Siren },
    { title: "Urgente ahora", value: stats.critical, detail: "señales críticas", tone: stats.critical ? "critical" : "low", href: "/alerts", Icon: AlertTriangle },
    { title: "Ejecución", value: stats.executionPressure, detail: "vencidas + bloqueadas", tone: stats.executionPressure ? "high" : "low", href: "/tasks", Icon: CheckSquare2 },
    { title: "Gobierno", value: stats.governancePressure, detail: "bloqueos + sin próxima acción", tone: stats.governancePressure ? "high" : "low", href: "/projects", Icon: FolderKanban },
    { title: "Recursos", value: stats.assetPressure, detail: "vencidos o por renovar", tone: stats.assetPressure ? "critical" : "low", href: "/assets", Icon: ShieldCheck },
    { title: "Bien", value: stats.completedLast30, detail: "tareas cerradas en 30 días", tone: "low", href: "/tasks", Icon: CheckCircle2 },
  ] satisfies Array<{ title: string; value: number | string; detail: string; tone: Severity; href: string; Icon: ComponentType<{ className?: string }> }>;

  return <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">{items.map((item) => <CommandMetric key={item.title} {...item} />)}</div>;
}

function CommandMetric({ title, value, detail, tone: itemTone, href, Icon }: { title: string; value: number | string; detail: string; tone: Severity; href: string; Icon: ComponentType<{ className?: string }> }) {
  return (
    <Link href={href} className={`block rounded-xl border border-l-4 ${tone[itemTone].rail} bg-white px-3 py-2.5 shadow-sm hover:bg-slate-50`}>
      <div className="flex items-center gap-2"><Icon className={`size-4 ${tone[itemTone].text}`} /><p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">{title}</p></div>
      <div className="mt-1 flex items-end justify-between gap-2"><p className={`truncate text-xl font-semibold ${tone[itemTone].text}`}>{value}</p><ArrowRight className="size-3.5 text-slate-400" /></div>
      <p className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</p>
    </Link>
  );
}

function ChartPanel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><Icon className="size-4 text-slate-500" /><CardTitle className="text-sm">{title}</CardTitle></div></CardHeader>
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}

function DomainRiskChart({ items }: { items: ActionItem[] }) {
  const rows = (["tasks", "projects", "assets", "ideas", "alerts"] as Domain[]).filter((domain) => domain !== "all").map((domain) => {
    const domainItems = items.filter((item) => item.domain === domain);
    return { domain, label: domainLabel(domain), total: domainItems.length, dist: severityDistribution(domainItems) };
  });
  const max = Math.max(1, ...rows.map((row) => row.total));

  return <div className="space-y-2">{rows.map((row) => <StackRow key={row.domain} label={row.label} total={row.total} max={max} dist={row.dist} />)}</div>;
}

function StackRow({ label, total, max, dist }: { label: string; total: number; max: number; dist: Record<Severity, number> }) {
  return (
    <div className="grid grid-cols-[110px_1fr_42px] items-center gap-3 text-sm">
      <span className="truncate text-slate-600">{label}</span>
      <div className="h-6 overflow-hidden rounded-lg bg-slate-100">
        <div className="flex h-full" style={{ width: `${Math.max(4, (total / max) * 100)}%` }}>
          {(["critical", "high", "medium", "low", "info"] as Severity[]).map((level) => dist[level] ? <div key={level} className={tone[level].fill} style={{ width: `${(dist[level] / Math.max(total, 1)) * 100}%` }} /> : null)}
        </div>
      </div>
      <span className="text-right font-semibold text-slate-900">{total}</span>
    </div>
  );
}

function PressureChart({ actions }: { actions: ActionItem[] }) {
  const buckets = [
    { label: "Vencido", count: actions.filter((item) => item.date && diffDays(item.date) < 0).length, tone: "critical" as Severity },
    { label: "Hoy", count: actions.filter((item) => item.date && diffDays(item.date) === 0).length, tone: "high" as Severity },
    { label: "7 días", count: actions.filter((item) => item.date && diffDays(item.date) > 0 && diffDays(item.date) <= 7).length, tone: "medium" as Severity },
    { label: "30 días", count: actions.filter((item) => item.date && diffDays(item.date) > 7 && diffDays(item.date) <= 30).length, tone: "info" as Severity },
    { label: "Sin fecha", count: actions.filter((item) => !item.date).length, tone: "high" as Severity },
  ];
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return <div className="space-y-2">{buckets.map((bucket) => <BarRow key={bucket.label} label={bucket.label} value={bucket.count} max={max} tone={bucket.tone} />)}</div>;
}

function ProjectStatusChart({ projects }: { projects: KpiProject[] }) {
  const statuses = ["active", "blocked", "frozen", "completed", "idea", "analysis", "paused"];
  const rows = statuses.map((status) => ({ label: statusLabel(status), value: projects.filter((project) => project.status === status).length, tone: projectStatusTone(status) })).filter((row) => row.value > 0);
  const max = Math.max(1, ...rows.map((row) => row.value));
  return <div className="space-y-2">{rows.length ? rows.map((row) => <BarRow key={row.label} label={row.label} value={row.value} max={max} tone={row.tone} />) : <EmptyLine text="No hay proyectos en el filtro actual." />}</div>;
}

function TaskFlowChart({ tasks }: { tasks: KpiTask[] }) {
  const open = tasks.filter((task) => !["completed", "discarded"].includes(task.status));
  const rows = [
    { label: "Abiertas", value: open.length, tone: "medium" as Severity },
    { label: "Vencidas", value: open.filter((task) => isPast(task.dueDate)).length, tone: "critical" as Severity },
    { label: "Bloq./espera", value: open.filter((task) => ["blocked", "waiting"].includes(task.status)).length, tone: "high" as Severity },
    { label: "Cerradas 30d", value: tasks.filter((task) => task.completedAt && diffDays(task.completedAt) >= -30).length, tone: "low" as Severity },
  ];
  const max = Math.max(1, ...rows.map((row) => row.value));
  return <div className="space-y-2">{rows.map((row) => <BarRow key={row.label} label={row.label} value={row.value} max={max} tone={row.tone} />)}</div>;
}

function BarRow({ label, value, max, tone: rowTone }: { label: string; value: number; max: number; tone: Severity }) {
  return (
    <div className="grid grid-cols-[110px_1fr_42px] items-center gap-3 text-sm">
      <span className="truncate text-slate-600">{label}</span>
      <div className="h-6 rounded-lg bg-slate-100"><div className={`h-full rounded-lg ${tone[rowTone].fill}`} style={{ width: `${Math.max(value ? 4 : 0, (value / max) * 100)}%` }} /></div>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ActionQueue({ items }: { items: ActionItem[] }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><Siren className="size-4 text-slate-500" /><CardTitle className="text-sm">Cola de decisiones</CardTitle></div></CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(260px,1.2fr)_92px_120px_110px_42px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          <span>Señal</span><span>Severidad</span><span>Motivo</span><span>Fecha</span><span />
        </div>
        {items.length ? items.map((item) => <ActionRow key={`${item.domain}-${item.id}-${item.reason}`} item={item} />) : <div className="p-8 text-center text-sm text-slate-500">No hay señales con los filtros actuales.</div>}
      </CardContent>
    </Card>
  );
}

function ActionRow({ item }: { item: ActionItem }) {
  return (
    <div className="grid grid-cols-[minmax(260px,1.2fr)_92px_120px_110px_42px] items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <div className={`min-w-0 border-l-4 pl-2 ${tone[item.severity].rail}`}>
        <div className="flex min-w-0 items-center gap-2"><span className={`size-2 rounded-full ${tone[item.severity].dot}`} /><Link href={item.href} className="truncate text-sm font-semibold text-slate-950 hover:underline"><TextWithLinks value={item.title} /></Link></div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{domainLabel(item.domain)} · {item.subtitle}</p>
      </div>
      <SeverityBadge severity={item.severity} />
      <span className="truncate text-sm text-slate-600">{item.reason}</span>
      <span className="truncate text-xs text-slate-500">{item.date ? fmt(item.date) : "Sin fecha"}</span>
      <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg"><Link href={item.href} aria-label="Abrir"><ArrowRight className="size-4" /></Link></Button>
    </div>
  );
}

function ProjectRiskRanking({ projects }: { projects: ReturnType<typeof buildProjectRisks> }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><FolderKanban className="size-4 text-slate-500" /><CardTitle className="text-sm">Ranking de riesgo por proyecto</CardTitle></div></CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(220px,1fr)_72px_90px_82px_40px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"><span>Proyecto</span><span>Score</span><span>Señales</span><span>Avance</span><span /></div>
        {projects.length ? projects.map((project) => <ProjectRiskRow key={project.id} project={project} />) : <div className="p-8 text-center text-sm text-slate-500">No hay proyectos con riesgo en este filtro.</div>}
      </CardContent>
    </Card>
  );
}

function ProjectRiskRow({ project }: { project: ReturnType<typeof buildProjectRisks>[number] }) {
  const itemTone = project.score >= 8 ? "critical" : project.score >= 4 ? "high" : project.score > 0 ? "medium" : "low";
  return (
    <div className="grid grid-cols-[minmax(220px,1fr)_72px_90px_82px_40px] items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <div className={`min-w-0 border-l-4 pl-2 ${tone[itemTone].rail}`}><Link href={`/projects/${project.id}`} className="truncate text-sm font-semibold text-slate-950 hover:underline">{project.name}</Link><p className="truncate text-xs text-slate-500">{project.areaName || "Sin área"}</p></div>
      <span className={`font-semibold ${tone[itemTone].text}`}>{project.score}</span>
      <div className="flex flex-wrap gap-1 text-xs"><MiniSignal label="Vc" value={project.overdue} tone={project.overdue ? "critical" : "info"} /><MiniSignal label="Bl" value={project.blocked ? 1 : 0} tone={project.blocked ? "critical" : "info"} /><MiniSignal label="Al" value={project.alerts} tone={project.alerts ? "high" : "info"} /></div>
      <div className="flex items-center gap-2"><Progress value={project.progress} className="h-2" /><span className="w-8 text-xs text-slate-500">{project.progress}%</span></div>
      <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg"><Link href={`/projects/${project.id}`} aria-label="Abrir proyecto"><ArrowRight className="size-4" /></Link></Button>
    </div>
  );
}

function AreaHealthMatrix({ rows }: { rows: ReturnType<typeof buildAreaRows> }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><Layers3 className="size-4 text-slate-500" /><CardTitle className="text-sm">Matriz por área</CardTitle></div></CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(180px,1fr)_80px_82px_82px_82px_82px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"><span>Área</span><span>Salud</span><span>Proy.</span><span>Tareas</span><span>Venc.</span><span>Alertas</span></div>
        {rows.map((row) => <div key={row.id} className="grid grid-cols-[minmax(180px,1fr)_80px_82px_82px_82px_82px] items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"><span className="truncate text-sm font-semibold text-slate-950">{row.name}</span><SeverityBadge severity={row.tone} /><span className="text-sm text-slate-600">{row.projects}</span><span className="text-sm text-slate-600">{row.openTasks}</span><span className={row.overdue ? "font-semibold text-red-700" : "text-sm text-slate-600"}>{row.overdue}</span><span className={row.alerts ? "font-semibold text-orange-700" : "text-sm text-slate-600"}>{row.alerts}</span></div>)}
      </CardContent>
    </Card>
  );
}

function KnowledgePanel({ data, stats }: { data: KpisPayload; stats: ReturnType<typeof buildStats> }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-3 py-2"><div className="flex items-center gap-2"><Boxes className="size-4 text-slate-500" /><CardTitle className="text-sm">Control documental y base</CardTitle></div></CardHeader>
      <CardContent className="space-y-3 p-3">
        <SmallMetric label="Documentos" value={data.knowledge.documents} tone="info" />
        <SmallMetric label="Pizarras" value={data.knowledge.boards} tone="info" />
        <SmallMetric label="Ideas en inbox" value={stats.ideaInbox} tone={stats.ideaInbox ? "medium" : "low"} />
        <SmallMetric label="Ideas para revisar" value={stats.ideaReviewSoon} tone={stats.ideaReviewSoon ? "high" : "low"} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"><Filter className="mb-1 size-3.5" />Usá los filtros superiores para convertir este tablero en una consulta operativa: dominio, área, estado, prioridad, severidad, horizonte y texto.</div>
      </CardContent>
    </Card>
  );
}

function SmallMetric({ label, value, tone: metricTone }: { label: string; value: number; tone: Severity }) {
  return <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${tone[metricTone].soft}`}><span className="text-sm font-medium">{label}</span><span className="text-lg font-semibold leading-none">{value}</span></div>;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant="outline" className={`h-5 rounded-full px-2 text-[11px] ${tone[severity].soft}`}>{severityLabel[severity]}</Badge>;
}

function MiniSignal({ label, value, tone: signalTone }: { label: string; value: number; tone: Severity }) {
  return <span className={`rounded-md border px-1.5 py-0.5 ${tone[signalTone].soft}`}>{label} {value}</span>;
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-500">{text}</div>;
}

function buildActionItems(data: KpisPayload): ActionItem[] {
  const items: ActionItem[] = [];

  for (const task of data.tasks) {
    if (["completed", "discarded"].includes(task.status)) continue;
    const area = getArea(task);
    const overdue = isPast(task.dueDate);
    const soon = task.dueDate && diffDays(task.dueDate) >= 0 && diffDays(task.dueDate) <= 7;
    const blocked = ["blocked", "waiting"].includes(task.status);
    if (!overdue && !soon && !blocked && !task.isCritical) continue;
    const severity = overdue || task.status === "blocked" || task.isCritical ? "critical" : task.status === "waiting" ? "high" : "medium";
    items.push({ id: task.id, domain: "tasks", title: task.title, subtitle: task.project?.name || area.name || "Inbox", href: `/tasks?tab=${overdue ? "overdue" : blocked ? "blocked" : "today"}`, severity, reason: overdue ? "vencida" : blocked ? task.status === "waiting" ? "en espera" : "bloqueada" : task.isCritical ? "crítica" : "próxima", status: task.status, priority: task.priority, areaId: area.id, areaName: area.name, date: task.dueDate, score: severityScore(severity) + (overdue ? 4 : 0) });
  }

  for (const project of data.projects) {
    if (["completed", "discarded"].includes(project.status)) continue;
    const noNext = project.status === "active" && !project.nextAction?.trim();
    const targetSoon = project.targetDate && diffDays(project.targetDate) <= 14;
    const blocked = project.status === "blocked" || Boolean(project.blockedReason);
    if (!blocked && !noNext && !targetSoon) continue;
    const severity = blocked ? "critical" : noNext ? "high" : "medium";
    items.push({ id: project.id, domain: "projects", title: project.name, subtitle: project.area?.name || "Sin área", href: `/projects/${project.id}`, severity, reason: blocked ? "bloqueado" : noNext ? "sin próxima acción" : "objetivo próximo", status: project.status, priority: project.priority, areaId: project.area?.id, areaName: project.area?.name, date: project.targetDate, score: severityScore(severity) + (project.priority === "critical" ? 3 : 0) });
  }

  for (const asset of data.assets) {
    const expired = asset.status === "expired" || isPast(asset.renewalDate);
    const soon = asset.renewalDate && diffDays(asset.renewalDate) >= 0 && diffDays(asset.renewalDate) <= 30;
    if (!expired && !soon) continue;
    const area = getArea(asset);
    const severity = expired ? "critical" : diffDays(asset.renewalDate) <= 7 ? "high" : "medium";
    items.push({ id: asset.id, domain: "assets", title: asset.name, subtitle: asset.provider || asset.project?.name || area.name || asset.type, href: "/assets", severity, reason: expired ? "vencido" : "renovación", status: asset.status, areaId: area.id, areaName: area.name, date: asset.renewalDate, score: severityScore(severity) });
  }

  for (const idea of data.ideas) {
    if (idea.status !== "inbox") continue;
    const reviewSoon = idea.reviewDate && diffDays(idea.reviewDate) <= 14;
    if (!reviewSoon) continue;
    const area = getArea(idea);
    const severity = isPast(idea.reviewDate) ? "high" : "medium";
    items.push({ id: idea.id, domain: "ideas", title: idea.title, subtitle: idea.project?.name || area.name || idea.origin, href: "/ideas", severity, reason: "revisión", status: idea.status, priority: idea.potential, areaId: area.id, areaName: area.name, date: idea.reviewDate, score: severityScore(severity) });
  }

  for (const alert of data.alerts) {
    if (alert.status !== "active") continue;
    const area = getArea(alert);
    const severity = alert.severity;
    items.push({ id: alert.id, domain: "alerts", title: alert.title, subtitle: alert.project?.name || area.name || alert.type, href: "/alerts", severity, reason: alert.type, status: alert.status, priority: null, areaId: area.id, areaName: area.name, date: alert.createdAt, score: severityScore(severity) + 1 });
  }

  return items.sort((a, b) => b.score - a.score || severityScore(b.severity) - severityScore(a.severity) || dateSort(a.date, b.date));
}

function scopeData(data: KpisPayload, filters: Filters) {
  return {
    tasks: data.tasks.filter((item) => matchesEntity(item, filters, "tasks", item.dueDate || item.completedAt)),
    projects: data.projects.filter((item) => matchesEntity(item, filters, "projects", item.targetDate)),
    assets: data.assets.filter((item) => matchesEntity(item, filters, "assets", item.renewalDate)),
    ideas: data.ideas.filter((item) => matchesEntity(item, filters, "ideas", item.reviewDate)),
    alerts: data.alerts.filter((item) => matchesEntity(item, filters, "alerts", item.createdAt)),
  };
}

function matchesAction(item: ActionItem, filters: Filters) {
  if (filters.domain !== "all" && item.domain !== filters.domain) return false;
  if (filters.areaId !== "all" && item.areaId !== filters.areaId) return false;
  if (filters.status !== "all" && !matchesStatus(item.status, filters.status)) return false;
  if (filters.priority !== "all" && item.priority !== filters.priority) return false;
  if (filters.severity !== "all" && item.severity !== filters.severity) return false;
  if (!matchesWindow(item.date, filters.window, item.severity)) return false;
  return matchesSearch([item.title, item.subtitle, item.reason, item.areaName], filters.search);
}

function matchesEntity(item: KpiTask | KpiProject | KpiAsset | KpiIdea | KpiAlert, filters: Filters, domain: Domain, date: string | null) {
  if (filters.domain !== "all" && filters.domain !== domain) return false;
  const area = getArea(item);
  if (filters.areaId !== "all" && area.id !== filters.areaId) return false;
  if (filters.status !== "all" && !matchesStatus(item.status, filters.status)) return false;
  if (filters.priority !== "all" && "priority" in item && item.priority !== filters.priority) return false;
  if (!matchesWindow(date, filters.window, "info")) return false;
  const searchable = "title" in item ? item.title : "name" in item ? item.name : "";
  return matchesSearch([searchable, area.name, "project" in item ? item.project?.name : null], filters.search);
}

function buildStats(scoped: ReturnType<typeof scopeData>, actions: ActionItem[], knowledge: KpisPayload["knowledge"]) {
  const openTasks = scoped.tasks.filter((task) => !["completed", "discarded"].includes(task.status));
  const activeProjects = scoped.projects.filter((project) => project.status === "active");
  const blockedProjects = scoped.projects.filter((project) => project.status === "blocked" || Boolean(project.blockedReason));
  const withoutNext = activeProjects.filter((project) => !project.nextAction?.trim());
  const assetPressure = scoped.assets.filter((asset) => asset.status === "expired" || isPast(asset.renewalDate) || asset.renewalDate && diffDays(asset.renewalDate) <= 30).length;
  return {
    critical: actions.filter((item) => item.severity === "critical").length,
    high: actions.filter((item) => item.severity === "high").length,
    executionPressure: openTasks.filter((task) => isPast(task.dueDate) || ["blocked", "waiting"].includes(task.status)).length,
    governancePressure: blockedProjects.length + withoutNext.length,
    assetPressure,
    completedLast30: scoped.tasks.filter((task) => task.completedAt && diffDays(task.completedAt) >= -30).length,
    ideaInbox: scoped.ideas.filter((idea) => idea.status === "inbox").length,
    ideaReviewSoon: scoped.ideas.filter((idea) => idea.status === "inbox" && idea.reviewDate && diffDays(idea.reviewDate) <= 14).length,
    knowledge,
  };
}

function buildProjectRisks(projects: KpiProject[], tasks: KpiTask[], alerts: KpiAlert[], assets: KpiAsset[]) {
  return projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project?.id === project.id);
    const overdue = projectTasks.filter((task) => isPast(task.dueDate)).length;
    const blockedTasks = projectTasks.filter((task) => ["blocked", "waiting"].includes(task.status)).length;
    const projectAlerts = alerts.filter((alert) => alert.project?.id === project.id && alert.status === "active").length;
    const assetIssues = assets.filter((asset) => asset.project?.id === project.id && (asset.status === "expired" || isPast(asset.renewalDate))).length;
    const blocked = project.status === "blocked" || Boolean(project.blockedReason);
    const noNext = project.status === "active" && !project.nextAction?.trim();
    const targetSoon = project.targetDate && diffDays(project.targetDate) <= 14;
    const score = overdue * 3 + blockedTasks * 2 + projectAlerts * 3 + assetIssues * 3 + (blocked ? 5 : 0) + (noNext ? 3 : 0) + (targetSoon ? 2 : 0);
    return { id: project.id, name: project.name, areaName: project.area?.name, score, overdue, blocked, alerts: projectAlerts, progress: project.progressPercentage || 0 };
  }).filter((project) => project.score > 0).sort((a, b) => b.score - a.score);
}

function buildAreaRows(areas: AreaRef[], scoped: ReturnType<typeof scopeData>) {
  return areas.map((area) => {
    const projects = scoped.projects.filter((project) => project.area?.id === area.id);
    const tasks = scoped.tasks.filter((task) => getArea(task).id === area.id);
    const alerts = scoped.alerts.filter((alert) => getArea(alert).id === area.id && alert.status === "active");
    const overdue = tasks.filter((task) => isPast(task.dueDate)).length;
    const critical = overdue + alerts.filter((alert) => ["critical", "high"].includes(alert.severity)).length + projects.filter((project) => project.status === "blocked").length;
    const rowTone: Severity = critical ? "critical" : tasks.length || projects.length ? "medium" : "info";
    return { id: area.id, name: area.name, projects: projects.length, openTasks: tasks.filter((task) => !["completed", "discarded"].includes(task.status)).length, overdue, alerts: alerts.length, tone: rowTone };
  }).sort((a, b) => severityScore(b.tone) - severityScore(a.tone) || b.overdue - a.overdue || b.alerts - a.alerts);
}

function severityDistribution(items: ActionItem[]) {
  return (["critical", "high", "medium", "low", "info"] as Severity[]).reduce((acc, level) => ({ ...acc, [level]: items.filter((item) => item.severity === level).length }), {} as Record<Severity, number>);
}

function getGlobalStatus(actions: ActionItem[]) {
  const critical = actions.filter((item) => item.severity === "critical").length;
  const high = actions.filter((item) => item.severity === "high").length;
  if (critical > 0) return { label: "Crítico", tone: "critical" as Severity, detail: `${critical} señales críticas` };
  if (high > 0) return { label: "Tenso", tone: "high" as Severity, detail: `${high} señales altas` };
  if (actions.length > 0) return { label: "Controlado", tone: "medium" as Severity, detail: `${actions.length} señales medias` };
  return { label: "Sano", tone: "low" as Severity, detail: "sin señales de atención" };
}

function matchesStatus(status: string, filter: string) {
  if (filter === "all") return true;
  if (filter === "open") return !["completed", "discarded", "archived", "resolved", "dismissed", "cancelled"].includes(status);
  return status === filter;
}

function matchesWindow(date: string | null | undefined, window: WindowFilter, severity: Severity) {
  if (window === "all") return true;
  if (!date) return ["critical", "high"].includes(severity);
  const diff = diffDays(date);
  const limit = Number(window);
  return diff >= -limit && diff <= limit;
}

function matchesSearch(parts: Array<string | null | undefined>, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return parts.filter(Boolean).join(" ").toLowerCase().includes(query);
}

function getArea(item: { area?: AreaRef | null; project?: ProjectRef }) {
  return { id: item.area?.id || item.project?.areaId || null, name: item.area?.name || "Sin área" };
}

function isPast(date: string | null | undefined) {
  return Boolean(date && diffDays(date) < 0);
}

function diffDays(date: string | null | undefined) {
  if (!date) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY);
}

function dateSort(a?: string | null, b?: string | null) {
  return diffDays(a) - diffDays(b);
}

function severityScore(severity: Severity) {
  if (severity === "critical") return 5;
  if (severity === "high") return 4;
  if (severity === "medium") return 3;
  if (severity === "low") return 1;
  return 0;
}

function domainLabel(domain: Domain) {
  return { all: "Todo", tasks: "Tareas", projects: "Proyectos", assets: "Activos", ideas: "Ideas", alerts: "Alertas" }[domain];
}

function statusLabel(status: string) {
  return { active: "Activos", blocked: "Bloqueados", frozen: "Congelados", completed: "Completados", idea: "Ideas", analysis: "Análisis", paused: "Pausados" }[status] || status;
}

function projectStatusTone(status: string): Severity {
  if (status === "blocked") return "critical";
  if (status === "active") return "medium";
  if (status === "completed") return "low";
  return "info";
}
