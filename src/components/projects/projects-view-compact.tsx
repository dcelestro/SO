"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, Clock3, FolderKanban, Lock, Search, Snowflake, Target } from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { labels, Status, days, TextWithLinks } from "@/components/workspace";
import { ProjectActionMenu } from "@/components/projects/project-action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SemanticBadge } from "@/components/visual-hierarchy";

type ProjectFilter = "attention" | "active" | "blocked" | "missing_next" | "frozen" | "production" | "completed" | "all";
type Tone = "critical" | "high" | "medium" | "low" | "info";

const tone = {
  critical: { rail: "border-l-red-500", dot: "bg-red-500", tint: "bg-red-50 text-red-700 ring-red-100", soft: "border-red-200 bg-red-50 text-red-700" },
  high: { rail: "border-l-orange-500", dot: "bg-orange-500", tint: "bg-orange-50 text-orange-700 ring-orange-100", soft: "border-orange-200 bg-orange-50 text-orange-700" },
  medium: { rail: "border-l-blue-500", dot: "bg-blue-500", tint: "bg-blue-50 text-blue-700 ring-blue-100", soft: "border-blue-200 bg-blue-50 text-blue-700" },
  low: { rail: "border-l-emerald-500", dot: "bg-emerald-500", tint: "bg-emerald-50 text-emerald-700 ring-emerald-100", soft: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  info: { rail: "border-l-slate-400", dot: "bg-slate-400", tint: "bg-slate-50 text-slate-600 ring-slate-100", soft: "border-slate-200 bg-slate-50 text-slate-600" },
} satisfies Record<Tone, Record<string, string>>;

const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function ProjectsView({ projects }: { projects: any[] }) {
  const { data } = useData();
  const [rows, setRows] = useState(projects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("attention");

  useEffect(() => setRows(projects), [projects]);

  const areas = data?.areas || [];
  const sorted = [...rows].filter((project) => project.status !== "discarded").sort(sortProjects);
  const stats = getStats(sorted);
  const visible = filterProjects(sorted, filter, search);
  const focus = sorted.find(isAttentionProject) || sorted.find((project) => project.status === "active") || sorted[0] || null;

  function mergeProject(updatedProject: any) {
    setRows((prev) => prev.map((project) => project.id === updatedProject.id ? { ...project, ...updatedProject, area: updatedProject.area ?? project.area, tasks: updatedProject.tasks ?? project.tasks } : project));
  }

  function removeProject(projectId: string) {
    setRows((prev) => prev.filter((project) => project.id !== projectId));
  }

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-7">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 text-sm">
            <button type="button" onClick={() => setFilter("attention")} className="font-medium text-slate-600 hover:text-slate-950">Proyectos</button>
            <ArrowRight className="size-3.5 text-slate-300" />
            <span className="font-semibold text-slate-950">{filterTitle(filter)}</span>
            <div className="ml-auto flex min-w-64 items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proyecto" className="h-9 rounded-lg bg-white pl-9" />
              </div>
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-12rem)] md:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50/70 p-3 md:border-b-0 md:border-r">
              <CompactFocus project={focus} />
              <div className="mt-3 space-y-1.5">
                <FilterButton value="attention" label="Requieren atención" count={stats.attention} active={filter} onSelect={setFilter} Icon={AlertTriangle} />
                <FilterButton value="active" label="Activos" count={stats.active} active={filter} onSelect={setFilter} Icon={Target} />
                <FilterButton value="blocked" label="Bloqueados" count={stats.blocked} active={filter} onSelect={setFilter} Icon={Lock} />
                <FilterButton value="missing_next" label="Sin próxima acción" count={stats.missingNext} active={filter} onSelect={setFilter} Icon={Clock3} />
                <FilterButton value="frozen" label="Congelados" count={stats.frozen} active={filter} onSelect={setFilter} Icon={Snowflake} />
                <FilterButton value="production" label="Producción / mant." count={stats.production} active={filter} onSelect={setFilter} Icon={CheckCircle2} />
                <FilterButton value="completed" label="Completados" count={stats.completed} active={filter} onSelect={setFilter} Icon={CheckCircle2} />
                <FilterButton value="all" label="Todos" count={stats.total} active={filter} onSelect={setFilter} Icon={Boxes} />
              </div>
            </aside>

            <main className="p-3">
              <MetricStrip stats={stats} onSelect={setFilter} />
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[minmax(260px,1.3fr)_140px_150px_120px_96px_40px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <span>Proyecto</span><span>Estado</span><span>Próxima acción</span><span>Señales</span><span>Avance</span><span />
                </div>
                {visible.length ? visible.map((project) => <ProjectRow key={project.id} project={project} areas={areas} data={data} onUpdated={mergeProject} onArchived={removeProject} />) : <div className="p-8 text-center text-sm text-slate-500">No hay proyectos en esta vista.</div>}
              </div>
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompactFocus({ project }: { project: any | null }) {
  if (!project) return <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">Sin frentes abiertos.</div>;
  const t = projectTone(project);
  return (
    <Link href={`/projects/${project.id}`} className={`block rounded-xl border border-l-4 ${tone[t].rail} bg-white p-3 hover:bg-slate-50`}>
      <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${tone[t].dot}`} /><p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950"><TextWithLinks value={project.name} /></p><ArrowRight className="size-4 text-slate-400" /></div>
      <p className="mt-1 truncate text-xs text-slate-500">{projectReason(project)}</p>
    </Link>
  );
}

function MetricStrip({ stats, onSelect }: { stats: ReturnType<typeof getStats>; onSelect: (value: ProjectFilter) => void }) {
  const items: [ProjectFilter, string, number, Tone][] = [["active", "Activos", stats.active, "medium"], ["blocked", "Bloqueados", stats.blocked, "critical"], ["missing_next", "Sin próxima", stats.missingNext, "high"], ["frozen", "Congelados", stats.frozen, "info"]];
  return <div className="grid gap-2 sm:grid-cols-4">{items.map(([value, label, count, t]) => <button key={value} onClick={() => onSelect(value)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${tone[t].soft}`}><span className={`size-2 rounded-full ${tone[t].dot}`} /><span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span><span className="text-lg font-semibold leading-none">{count}</span></button>)}</div>;
}

function FilterButton({ value, label, count, active, onSelect, Icon }: { value: ProjectFilter; label: string; count: number; active: ProjectFilter; onSelect: (value: ProjectFilter) => void; Icon: ComponentType<{ className?: string }> }) {
  const t = value === "blocked" || value === "attention" ? "critical" : value === "missing_next" ? "high" : value === "active" ? "medium" : value === "completed" || value === "production" ? "low" : "info";
  return <button type="button" onClick={() => onSelect(value)} className={`flex w-full items-center gap-2 rounded-lg border border-l-4 px-2.5 py-2 text-left text-sm transition ${active === value ? "border-slate-300 bg-white text-slate-950" : "border-slate-100 bg-transparent text-slate-600 hover:bg-white"} ${tone[t].rail}`}><Icon className="size-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{label}</span><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{count}</Badge></button>;
}

function ProjectRow({ project, areas, data, onUpdated, onArchived }: { project: any; areas: any[]; data: any; onUpdated: (project: any) => void; onArchived: (projectId: string) => void }) {
  const t = projectTone(project);
  const open = project.tasks?.length || 0;
  const blocked = project.tasks?.filter((task: any) => task.status === "blocked").length || 0;
  const overdue = project.tasks?.filter((task: any) => taskOverdue(task)).length || 0;
  const inFocus = [data?.focus?.mainProjectId, ...(data?.focus?.secondaryProjectIds || [])].includes(project.id);
  return (
    <div className="grid grid-cols-[minmax(260px,1.3fr)_140px_150px_120px_96px_40px] items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <div className={`min-w-0 border-l-4 pl-2 ${tone[t].rail}`}>
        <div className="flex min-w-0 items-center gap-2"><FolderKanban className="size-4 shrink-0 text-slate-400" /><Link href={`/projects/${project.id}`} className="truncate text-sm font-semibold text-slate-950 hover:underline"><TextWithLinks value={project.name} /></Link>{inFocus ? <SemanticBadge value="focus" label="Foco" /> : null}</div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{project.area?.name || "Sin área"} · {labels[project.maturity] || project.maturity || "sin madurez"}</p>
      </div>
      <div className="flex flex-wrap gap-1"><Status value={project.status} /><Status value={project.priority} /></div>
      <p className={`truncate text-sm ${needsNext(project) ? "font-semibold text-orange-800" : "text-slate-600"}`}>{project.nextAction || "Definir próxima acción"}</p>
      <div className="flex items-center gap-1 text-xs"><Signal label="Ab" value={open} tone="info" /><Signal label="Bl" value={blocked} tone={blocked ? "critical" : "low"} /><Signal label="Vc" value={overdue} tone={overdue ? "critical" : "low"} /></div>
      <div className="flex items-center gap-2"><Progress value={project.progressPercentage || 0} className="h-2" /><span className="w-8 text-xs text-slate-500">{project.progressPercentage || 0}%</span></div>
      <ProjectActionMenu project={project} areas={areas} onUpdated={onUpdated} onArchived={onArchived} />
    </div>
  );
}

function Signal({ label, value, tone: t }: { label: string; value: number; tone: Tone }) {
  return <span className={`rounded-md border px-1.5 py-0.5 ${tone[t].soft}`}>{label} {value}</span>;
}

function filterProjects(projects: any[], filter: ProjectFilter, search: string) {
  const query = search.trim().toLowerCase();
  return projects.filter((project) => {
    const match = !query || [project.name, project.description, project.nextAction, project.blockedReason, project.area?.name].filter(Boolean).join(" ").toLowerCase().includes(query);
    if (!match) return false;
    if (filter === "attention") return isAttentionProject(project);
    if (filter === "active") return project.status === "active";
    if (filter === "blocked") return project.status === "blocked";
    if (filter === "missing_next") return needsNext(project);
    if (filter === "frozen") return project.status === "frozen" || project.isFrozen;
    if (filter === "production") return project.maturity === "production" || project.maturity === "maintenance";
    if (filter === "completed") return project.status === "completed";
    return true;
  });
}

function getStats(projects: any[]) {
  return { total: projects.length, attention: projects.filter(isAttentionProject).length, active: projects.filter((p) => p.status === "active").length, blocked: projects.filter((p) => p.status === "blocked").length, missingNext: projects.filter(needsNext).length, frozen: projects.filter((p) => p.status === "frozen" || p.isFrozen).length, production: projects.filter((p) => p.maturity === "production" || p.maturity === "maintenance").length, completed: projects.filter((p) => p.status === "completed").length };
}

function sortProjects(a: any, b: any) { return score(b) - score(a) || new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(); }
function score(p: any) { return (p.status === "blocked" ? 100 : 0) + (needsNext(p) ? 70 : 0) + ((p.tasks || []).some((t: any) => taskOverdue(t)) ? 55 : 0) + (p.priority === "critical" ? 45 : 0) + (p.status === "active" ? 30 : 0) + (priorityRank[p.priority] ?? 0) * 8; }
function isAttentionProject(p: any) { return p.status === "blocked" || needsNext(p) || p.priority === "critical" || (p.tasks || []).some((t: any) => t.status === "blocked" || taskOverdue(t)); }
function needsNext(p: any) { return p.status === "active" && !p.nextAction; }
function taskOverdue(t: any) { return Boolean(t.dueDate && days(t.dueDate) < 0 && t.status !== "completed"); }
function projectTone(p: any): Tone { if (p.status === "blocked" || (p.tasks || []).some((t: any) => t.status === "blocked" || taskOverdue(t))) return "critical"; if (needsNext(p) || p.priority === "critical" || p.priority === "high") return "high"; if (p.status === "active") return "medium"; if (p.status === "completed") return "low"; return "info"; }
function projectReason(p: any) { if (p.status === "blocked") return p.blockedReason ? "bloqueado con motivo" : "bloqueado sin motivo"; if (needsNext(p)) return "activo sin próxima acción"; if ((p.tasks || []).some((t: any) => taskOverdue(t))) return "tiene tareas vencidas"; if (p.status === "frozen" || p.isFrozen) return "congelado"; if (p.status === "active") return "frente activo"; return labels[p.status] || "frente registrado"; }
function filterTitle(active: ProjectFilter) { return { attention: "Requieren atención", active: "Activos", blocked: "Bloqueados", missing_next: "Sin próxima acción", frozen: "Congelados", production: "Producción / mantenimiento", completed: "Completados", all: "Todos" }[active]; }
