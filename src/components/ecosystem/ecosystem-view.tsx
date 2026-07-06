"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Boxes, FolderKanban, FolderTree, Layers3, Search, ShieldCheck, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { labels, Status, days, TextWithLinks } from "@/components/workspace";

type Filter = "area" | "attention" | "blocked" | "missing_next" | "resources" | "all";
type Tone = "critical" | "high" | "medium" | "low" | "info";

const tone = {
  critical: { rail: "border-l-red-500", dot: "bg-red-500", soft: "border-red-200 bg-red-50 text-red-700" },
  high: { rail: "border-l-orange-500", dot: "bg-orange-500", soft: "border-orange-200 bg-orange-50 text-orange-700" },
  medium: { rail: "border-l-blue-500", dot: "bg-blue-500", soft: "border-blue-200 bg-blue-50 text-blue-700" },
  low: { rail: "border-l-emerald-500", dot: "bg-emerald-500", soft: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  info: { rail: "border-l-slate-400", dot: "bg-slate-400", soft: "border-slate-200 bg-slate-50 text-slate-600" },
} satisfies Record<Tone, Record<string, string>>;

export function EcosystemView({ areas }: { areas: any[] }) {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(areas[0]?.id ?? null);
  const [filter, setFilter] = useState<Filter>("area");
  const [search, setSearch] = useState("");

  const selectedArea = areas.find((area) => area.id === selectedAreaId) ?? areas[0] ?? null;
  const projects = useMemo(() => areas.flatMap((area) => (area.projects || []).map((project: any) => ({ ...project, area }))), [areas]);
  const stats = getStats(areas, projects);
  const visibleProjects = filterProjects(projects, selectedArea, filter, search);

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-7">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 text-sm">
            <button type="button" onClick={() => setFilter("area")} className="font-medium text-slate-600 hover:text-slate-950">Ecosistema</button>
            {selectedArea ? <><ArrowRight className="size-3.5 text-slate-300" /><span className="font-semibold text-slate-950">{selectedArea.name}</span></> : null}
            <div className="ml-auto flex min-w-72 items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar área, proyecto o módulo" className="h-9 rounded-lg bg-white pl-9" />
              </div>
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-12rem)] md:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50/70 p-3 md:border-b-0 md:border-r">
              <div className="rounded-xl border border-l-4 border-l-blue-500 bg-white p-3">
                <div className="flex items-center gap-2"><FolderTree className="size-4 text-blue-600" /><p className="text-sm font-semibold text-slate-950">Mapa del sistema</p></div>
                <p className="mt-1 text-xs text-slate-500">Áreas → proyectos → módulos, recursos y señales.</p>
              </div>

              <div className="mt-3 space-y-1.5">
                <FilterButton value="area" label="Área seleccionada" count={selectedArea?.projects?.length || 0} active={filter} onSelect={setFilter} icon="area" />
                <FilterButton value="attention" label="Requieren atención" count={stats.attention} active={filter} onSelect={setFilter} icon="attention" />
                <FilterButton value="blocked" label="Bloqueados" count={stats.blocked} active={filter} onSelect={setFilter} icon="blocked" />
                <FilterButton value="missing_next" label="Sin próxima acción" count={stats.missingNext} active={filter} onSelect={setFilter} icon="missing" />
                <FilterButton value="resources" label="Con recursos/señales" count={stats.withResources} active={filter} onSelect={setFilter} icon="resources" />
                <FilterButton value="all" label="Todo el ecosistema" count={stats.projects} active={filter} onSelect={setFilter} icon="all" />
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Áreas</p>
                <div className="space-y-1.5">
                  {areas.map((area) => <AreaButton key={area.id} area={area} selected={area.id === selectedArea?.id} onClick={() => { setSelectedAreaId(area.id); setFilter("area"); }} />)}
                </div>
              </div>
            </aside>

            <main className="p-3">
              <MetricStrip stats={stats} />
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[minmax(260px,1.25fr)_150px_160px_170px_110px_40px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <span>Entidad</span><span>Estado</span><span>Estructura</span><span>Señales</span><span>Avance</span><span />
                </div>
                {visibleProjects.length ? visibleProjects.map((project) => <ProjectRow key={project.id} project={project} />) : <div className="p-8 text-center text-sm text-slate-500">No hay entidades para esta vista.</div>}
              </div>
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}

function AreaButton({ area, selected, onClick }: { area: any; selected: boolean; onClick: () => void }) {
  const projectCount = area.projects?.length || 0;
  const blocked = (area.projects || []).filter((project: any) => project.status === "blocked").length;
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg border border-l-4 px-2.5 py-2 text-left text-sm transition ${selected ? "border-slate-300 bg-white text-slate-950" : "border-slate-100 bg-transparent text-slate-600 hover:bg-white"} ${blocked ? tone.critical.rail : tone.info.rail}`}><FolderTree className="size-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{area.name}</span><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{projectCount}</Badge></button>;
}

function FilterButton({ value, label, count, active, onSelect, icon }: { value: Filter; label: string; count: number; active: Filter; onSelect: (value: Filter) => void; icon: "area" | "attention" | "blocked" | "missing" | "resources" | "all" }) {
  const Icon = icon === "attention" ? AlertTriangle : icon === "blocked" ? AlertTriangle : icon === "resources" ? ShieldCheck : icon === "all" ? Boxes : icon === "missing" ? Target : FolderTree;
  const t: Tone = value === "blocked" || value === "attention" ? "critical" : value === "missing_next" ? "high" : value === "resources" ? "medium" : "info";
  return <button type="button" onClick={() => onSelect(value)} className={`flex w-full items-center gap-2 rounded-lg border border-l-4 px-2.5 py-2 text-left text-sm transition ${active === value ? "border-slate-300 bg-white text-slate-950" : "border-slate-100 bg-transparent text-slate-600 hover:bg-white"} ${tone[t].rail}`}><Icon className="size-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{label}</span><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{count}</Badge></button>;
}

function MetricStrip({ stats }: { stats: ReturnType<typeof getStats> }) {
  const items: [string, number, Tone][] = [["Áreas", stats.areas, "info"], ["Proyectos", stats.projects, "medium"], ["Bloqueados", stats.blocked, "critical"], ["Alertas", stats.alerts, stats.alerts ? "high" : "low"]];
  return <div className="grid gap-2 sm:grid-cols-4">{items.map(([label, count, t]) => <div key={label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${tone[t].soft}`}><span className={`size-2 rounded-full ${tone[t].dot}`} /><span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span><span className="text-lg font-semibold leading-none">{count}</span></div>)}</div>;
}

function ProjectRow({ project }: { project: any }) {
  const t = projectTone(project);
  const moduleCount = project.modules?.length || 0;
  const taskCount = project.tasks?.length || 0;
  const assetCount = project.assets?.length || 0;
  const ideaCount = project.ideas?.length || 0;
  const alertCount = project.alerts?.length || 0;
  return (
    <div className="grid grid-cols-[minmax(260px,1.25fr)_150px_160px_170px_110px_40px] items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <div className={`min-w-0 border-l-4 pl-2 ${tone[t].rail}`}>
        <div className="flex min-w-0 items-center gap-2"><FolderKanban className="size-4 shrink-0 text-slate-400" /><Link href={`/projects/${project.id}`} className="truncate text-sm font-semibold text-slate-950 hover:underline"><TextWithLinks value={project.name} /></Link></div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{project.area?.name || "Sin área"} · {project.nextAction || "sin próxima acción"}</p>
      </div>
      <div className="flex flex-wrap gap-1"><Status value={project.status} /><Status value={project.priority} /></div>
      <div className="flex flex-wrap gap-1 text-xs"><Signal label="Mód" value={moduleCount} tone="info" /><Signal label="Tar" value={taskCount} tone={taskCount ? "medium" : "info"} /></div>
      <div className="flex flex-wrap gap-1 text-xs"><Signal label="Rec" value={assetCount} tone={resourceTone(project)} /><Signal label="Ide" value={ideaCount} tone={ideaCount ? "medium" : "info"} /><Signal label="Al" value={alertCount} tone={alertCount ? "critical" : "low"} /></div>
      <div className="flex items-center gap-2"><Progress value={project.progressPercentage || 0} className="h-2" /><span className="w-8 text-xs text-slate-500">{project.progressPercentage || 0}%</span></div>
      <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg"><Link href={`/explorer?type=project&id=${project.id}`} aria-label="Abrir en Explorador"><ArrowRight className="size-4" /></Link></Button>
    </div>
  );
}

function Signal({ label, value, tone: t }: { label: string; value: number; tone: Tone }) {
  return <span className={`rounded-md border px-1.5 py-0.5 ${tone[t].soft}`}>{label} {value}</span>;
}

function getStats(areas: any[], projects: any[]) {
  return {
    areas: areas.length,
    projects: projects.length,
    blocked: projects.filter((project) => project.status === "blocked").length,
    missingNext: projects.filter((project) => project.status === "active" && !project.nextAction).length,
    attention: projects.filter(isAttention).length,
    withResources: projects.filter((project) => (project.assets?.length || 0) + (project.ideas?.length || 0) + (project.alerts?.length || 0) > 0).length,
    alerts: projects.reduce((total, project) => total + (project.alerts?.length || 0), 0),
  };
}

function filterProjects(projects: any[], area: any, filter: Filter, search: string) {
  const query = search.trim().toLowerCase();
  return projects.filter((project) => {
    const match = !query || [project.name, project.description, project.nextAction, project.area?.name, ...(project.modules || []).map((module: any) => module.name)].filter(Boolean).join(" ").toLowerCase().includes(query);
    if (!match) return false;
    if (filter === "area") return area ? project.areaId === area.id : true;
    if (filter === "attention") return isAttention(project);
    if (filter === "blocked") return project.status === "blocked";
    if (filter === "missing_next") return project.status === "active" && !project.nextAction;
    if (filter === "resources") return (project.assets?.length || 0) + (project.ideas?.length || 0) + (project.alerts?.length || 0) > 0;
    return true;
  });
}

function isAttention(project: any) {
  return project.status === "blocked" || (project.status === "active" && !project.nextAction) || (project.alerts?.length || 0) > 0 || (project.tasks || []).some((task: any) => task.status === "blocked" || task.dueDate && days(task.dueDate) < 0);
}

function projectTone(project: any): Tone {
  if (project.status === "blocked" || (project.alerts?.length || 0) > 0) return "critical";
  if (project.status === "active" && !project.nextAction) return "high";
  if (project.status === "active") return "medium";
  if (project.status === "completed") return "low";
  return "info";
}

function resourceTone(project: any): Tone {
  if ((project.assets || []).some((asset: any) => asset.status === "expired" || asset.renewalDate && days(asset.renewalDate) <= 7)) return "critical";
  return project.assets?.length ? "medium" : "info";
}
