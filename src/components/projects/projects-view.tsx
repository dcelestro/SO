"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Lock,
  Search,
  Snowflake,
  Target,
} from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { labels, Status, fmt, days, TextWithLinks } from "@/components/workspace";
import { ProjectActionMenu } from "@/components/projects/project-action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SemanticBadge } from "@/components/visual-hierarchy";

type ProjectFilter = "attention" | "active" | "blocked" | "missing_next" | "frozen" | "production" | "completed" | "all";
type ProjectTone = "critical" | "high" | "medium" | "low" | "info";

type ProjectStats = ReturnType<typeof getProjectStats>;

const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

const filterAccent: Record<ProjectFilter, string> = {
  attention: "border-l-red-500",
  active: "border-l-blue-500",
  blocked: "border-l-red-500",
  missing_next: "border-l-orange-500",
  frozen: "border-l-slate-500",
  production: "border-l-emerald-500",
  completed: "border-l-emerald-500",
  all: "border-l-slate-400",
};

export function ProjectsView({ projects }: { projects: any[] }) {
  const { data } = useData();
  const [projectRows, setProjectRows] = useState(projects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("attention");

  useEffect(() => {
    setProjectRows(projects);
  }, [projects]);

  const areas = data?.areas || [];
  const sortedProjects = [...projectRows].filter((project) => project.status !== "discarded").sort(sortProjects);
  const stats = getProjectStats(sortedProjects);
  const focusProject = sortedProjects.find(isAttentionProject) || sortedProjects.find((project) => project.status === "active") || sortedProjects[0] || null;
  const visibleProjects = filterProjects(sortedProjects, filter, search);

  function mergeProject(updatedProject: any) {
    setProjectRows((prev) =>
      prev.map((project) =>
        project.id === updatedProject.id
          ? {
              ...project,
              ...updatedProject,
              area: updatedProject.area ?? project.area,
              tasks: updatedProject.tasks ?? project.tasks,
            }
          : project,
      ),
    );
  }

  function removeProject(projectId: string) {
    setProjectRows((prev) => prev.filter((project) => project.id !== projectId));
  }

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#edf1f5]">
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="space-y-5">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Proyectos</h1>
              <p className="mt-1 text-sm text-slate-500">Centro de control de frentes activos: estado, próxima acción, bloqueos y señales.</p>
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proyecto, área o próxima acción" className="h-11 rounded-xl bg-white pl-9" />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
            <ProjectFocusCard project={focusProject} areas={areas} data={data} onUpdated={mergeProject} onArchived={removeProject} />
            <ProjectMetricGrid stats={stats} active={filter} onSelect={setFilter} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <ProjectFilterRail stats={stats} active={filter} onSelect={setFilter} />
            <ProjectWorkGrid projects={visibleProjects} areas={areas} data={data} active={filter} onUpdated={mergeProject} onArchived={removeProject} />
          </section>
        </div>
      </div>
    </div>
  );
}

function ProjectFocusCard({ project, areas, data, onUpdated, onArchived }: { project: any | null; areas: any[]; data: any; onUpdated: (project: any) => void; onArchived: (projectId: string) => void }) {
  if (!project) {
    return (
      <Card className="overflow-hidden border border-emerald-200 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm ring-1 ring-emerald-100/70">
        <CardContent className="flex min-h-[250px] flex-col justify-between p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Sin frentes abiertos
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">No hay proyectos activos para revisar.</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Los proyectos aparecerán acá cuando estén activos, bloqueados, congelados o pendientes de acción.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tone = getProjectTone(project);
  const openTasks = project.tasks?.length || 0;
  const blockedTasks = project.tasks?.filter((task: any) => task.status === "blocked").length || 0;
  const overdueTasks = project.tasks?.filter((task: any) => isTaskOverdue(task)).length || 0;
  const inFocus = isInFocus(project, data);
  const needsNext = needsNextAction(project);

  return (
    <Card className={`overflow-hidden border border-slate-200 border-l-4 ${sideBorder(tone)} bg-gradient-to-br from-white via-white to-slate-50 shadow-sm ring-1 ring-slate-200/70`}>
      <CardContent className="relative flex min-h-[250px] flex-col justify-between p-6">
        <div className={`absolute right-6 top-6 grid size-20 place-items-center rounded-full ring-1 ${toneBubble(tone)}`}>
          {tone === "critical" ? <AlertTriangle className="size-9" /> : project.status === "frozen" ? <Snowflake className="size-9" /> : <FolderKanban className="size-9" />}
        </div>
        <div className="pr-24">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950"><TextWithLinks value={project.name} /></h2>
            <Status value={project.status} />
            <Status value={project.priority} />
            {inFocus ? <SemanticBadge value="focus" label="Foco" /> : null}
            {needsNext ? <SemanticBadge value="overdue" label="Sin próxima acción" /> : null}
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">{project.area?.name || "Sin área"} · {projectReason(project)}</p>
          <div className={`mt-4 rounded-2xl border p-4 ${needsNext || project.status === "blocked" ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próxima acción</p>
            <p className={`mt-1 text-sm font-semibold ${needsNext ? "text-orange-800" : "text-slate-900"}`}>{project.nextAction || "Definir una próxima acción concreta"}</p>
            {project.blockedReason ? <p className="mt-2 text-xs leading-5 text-red-700">Bloqueo: {project.blockedReason}</p> : null}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-xl bg-slate-950 px-5 font-semibold hover:bg-slate-800">
            <Link href={`/projects/${project.id}`}>{project.status === "blocked" ? "Resolver bloqueo" : "Abrir proyecto"}<ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/tasks">Ver tareas ({openTasks})</Link>
          </Button>
          <ProjectActionMenu project={project} areas={areas} onUpdated={onUpdated} onArchived={onArchived} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SignalPill label="Tareas abiertas" value={openTasks} tone="info" />
          <SignalPill label="Bloqueadas" value={blockedTasks} tone={blockedTasks ? "critical" : "low"} />
          <SignalPill label="Vencidas" value={overdueTasks} tone={overdueTasks ? "critical" : "low"} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectMetricGrid({ stats, active, onSelect }: { stats: ProjectStats; active: ProjectFilter; onSelect: (value: ProjectFilter) => void }) {
  const metrics: { value: ProjectFilter; label: string; count: number; detail: string; Icon: ComponentType<{ className?: string }>; tone: ProjectTone }[] = [
    { value: "active", label: "Activos", count: stats.active, detail: "frentes abiertos", Icon: Target, tone: "medium" },
    { value: "blocked", label: "Bloqueados", count: stats.blocked, detail: "requieren destrabe", Icon: Lock, tone: "critical" },
    { value: "missing_next", label: "Sin próxima acción", count: stats.missingNext, detail: "falta definición", Icon: AlertTriangle, tone: "high" },
    { value: "frozen", label: "Congelados", count: stats.frozen, detail: "pausados conscientemente", Icon: Snowflake, tone: "info" },
  ];

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="grid h-full p-0 sm:grid-cols-2">
        {metrics.map(({ value, label, count, detail, Icon, tone }) => (
          <button key={value} type="button" onClick={() => onSelect(value)} className={`group border-t-4 ${topBorder(tone)} p-5 text-left transition hover:bg-slate-50 ${active === value ? "bg-slate-50" : "bg-white"}`}>
            <div className={`mb-4 grid size-9 place-items-center rounded-xl ring-1 ${toneBubble(tone)}`}>
              <Icon className="size-4" />
            </div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className={`mt-2 text-3xl font-semibold tracking-tight ${toneText(tone)}`}>{count}</p>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{detail}</span>
              <ArrowRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function ProjectFilterRail({ stats, active, onSelect }: { stats: ProjectStats; active: ProjectFilter; onSelect: (value: ProjectFilter) => void }) {
  const items: { value: ProjectFilter; label: string; count: number; Icon: ComponentType<{ className?: string }> }[] = [
    { value: "attention", label: "Requieren atención", count: stats.attention, Icon: AlertTriangle },
    { value: "active", label: "Activos", count: stats.active, Icon: Target },
    { value: "blocked", label: "Bloqueados", count: stats.blocked, Icon: Lock },
    { value: "missing_next", label: "Sin próxima acción", count: stats.missingNext, Icon: Clock3 },
    { value: "frozen", label: "Congelados", count: stats.frozen, Icon: Snowflake },
    { value: "production", label: "Producción / mant.", count: stats.production, Icon: CheckCircle2 },
    { value: "completed", label: "Completados", count: stats.completed, Icon: CheckCircle2 },
    { value: "all", label: "Todos", count: stats.total, Icon: Boxes },
  ];

  return (
    <Card className="h-fit overflow-hidden border border-slate-200 border-t-4 border-t-slate-400 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <CardTitle className="text-base">Vistas rápidas</CardTitle>
        <CardDescription>Separá frentes sanos de frentes que piden decisión.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-3">
        {items.map(({ value, label, count, Icon }) => (
          <button key={value} type="button" onClick={() => onSelect(value)} className={`flex w-full items-center gap-3 rounded-xl border border-l-4 px-3 py-2.5 text-left transition ${active === value ? "border-slate-300 bg-slate-100 text-slate-950" : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"} ${filterAccent[value]}`}>
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
            <Badge variant="outline" className="rounded-full bg-white">{count}</Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function ProjectWorkGrid({ projects, areas, data, active, onUpdated, onArchived }: { projects: any[]; areas: any[]; data: any; active: ProjectFilter; onUpdated: (project: any) => void; onArchived: (projectId: string) => void }) {
  return (
    <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-blue-400 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-slate-100 px-4 py-3">
        <div>
          <CardTitle className="text-base">{filterTitle(active)}</CardTitle>
          <CardDescription>{projects.length} proyecto{projects.length === 1 ? "" : "s"} en esta vista</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {projects.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} areas={areas} data={data} onUpdated={onUpdated} onArchived={onArchived} />
            ))}
          </div>
        ) : (
          <EmptyProjectState active={active} />
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project, areas, data, onUpdated, onArchived }: { project: any; areas: any[]; data: any; onUpdated: (project: any) => void; onArchived: (projectId: string) => void }) {
  const tone = getProjectTone(project);
  const inFocus = isInFocus(project, data);
  const needsAction = needsNextAction(project);
  const openTasks = project.tasks?.length || 0;
  const blockedTasks = project.tasks?.filter((task: any) => task.status === "blocked").length || 0;
  const overdueTasks = project.tasks?.filter((task: any) => isTaskOverdue(task)).length || 0;

  return (
    <Card className={`h-full overflow-hidden border border-slate-200 border-l-4 ${sideBorder(tone)} bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid size-10 place-items-center rounded-xl ring-1 ${toneBubble(tone)}`}>
            <FolderKanban className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            {inFocus ? <SemanticBadge value="focus" label="Foco" /> : null}
            <Status value={project.status} />
            <ProjectActionMenu project={project} areas={areas} onUpdated={onUpdated} onArchived={onArchived} />
          </div>
        </div>
        <CardTitle className="pt-2 text-base">
          <Link href={`/projects/${project.id}`} className="hover:underline"><TextWithLinks value={project.name} /></Link>
        </CardTitle>
        <CardDescription>{project.area?.name || "Sin área"} · {labels[project.maturity] || project.maturity || "sin madurez"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`min-h-24 rounded-2xl border p-3 ${needsAction || project.status === "blocked" ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próxima acción</p>
          <p className={`mt-1 line-clamp-3 text-sm font-semibold ${needsAction ? "text-orange-800" : "text-slate-900"}`}>{project.nextAction || "Definir una próxima acción concreta"}</p>
          {project.blockedReason ? <p className="mt-2 line-clamp-2 text-xs text-red-700">Bloqueo: {project.blockedReason}</p> : null}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Progreso</span>
            <span>{project.progressPercentage || 0}%</span>
          </div>
          <Progress value={project.progressPercentage || 0} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SignalPill label="Abiertas" value={openTasks} tone="info" />
          <SignalPill label="Bloq." value={blockedTasks} tone={blockedTasks ? "critical" : "low"} />
          <SignalPill label="Venc." value={overdueTasks} tone={overdueTasks ? "critical" : "low"} />
        </div>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={`/projects/${project.id}`}>Abrir frente<ArrowRight className="ml-2 size-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SignalPill({ label, value, tone }: { label: string; value: number; tone: ProjectTone }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${tonePill(tone)}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function EmptyProjectState({ active }: { active: ProjectFilter }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8"><p className="text-center text-sm text-slate-500">No hay proyectos en “{filterTitle(active)}”.</p></div>;
}

function filterProjects(projects: any[], filter: ProjectFilter, search: string) {
  const query = search.trim().toLowerCase();
  return projects.filter((project) => {
    const matchesSearch = !query || [project.name, project.description, project.nextAction, project.blockedReason, project.area?.name].filter(Boolean).join(" ").toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (filter === "attention") return isAttentionProject(project);
    if (filter === "active") return project.status === "active";
    if (filter === "blocked") return project.status === "blocked";
    if (filter === "missing_next") return needsNextAction(project);
    if (filter === "frozen") return project.status === "frozen" || project.isFrozen;
    if (filter === "production") return project.maturity === "production" || project.maturity === "maintenance";
    if (filter === "completed") return project.status === "completed";
    return true;
  });
}

function getProjectStats(projects: any[]) {
  return {
    total: projects.length,
    attention: projects.filter(isAttentionProject).length,
    active: projects.filter((project) => project.status === "active").length,
    blocked: projects.filter((project) => project.status === "blocked").length,
    missingNext: projects.filter(needsNextAction).length,
    frozen: projects.filter((project) => project.status === "frozen" || project.isFrozen).length,
    production: projects.filter((project) => project.maturity === "production" || project.maturity === "maintenance").length,
    completed: projects.filter((project) => project.status === "completed").length,
  };
}

function sortProjects(a: any, b: any) {
  return projectScore(b) - projectScore(a) || new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
}

function projectScore(project: any) {
  return (
    (project.status === "blocked" ? 100 : 0) +
    (needsNextAction(project) ? 70 : 0) +
    ((project.tasks || []).some((task: any) => isTaskOverdue(task)) ? 55 : 0) +
    (project.priority === "critical" ? 45 : 0) +
    (project.status === "active" ? 30 : 0) +
    (priorityRank[project.priority] ?? 0) * 8 +
    ((project.tasks || []).filter((task: any) => task.status === "blocked").length * 10)
  );
}

function isAttentionProject(project: any) {
  return project.status === "blocked" || needsNextAction(project) || project.priority === "critical" || (project.tasks || []).some((task: any) => task.status === "blocked" || isTaskOverdue(task));
}

function needsNextAction(project: any) {
  return project.status === "active" && !project.nextAction;
}

function isTaskOverdue(task: any) {
  return Boolean(task.dueDate && days(task.dueDate) < 0 && task.status !== "completed");
}

function isInFocus(project: any, data: any) {
  return [data?.focus?.mainProjectId, ...(data?.focus?.secondaryProjectIds || [])].includes(project.id);
}

function projectReason(project: any) {
  if (project.status === "blocked") return project.blockedReason ? "bloqueado con motivo registrado" : "bloqueado sin motivo visible";
  if (needsNextAction(project)) return "activo sin próxima acción";
  if ((project.tasks || []).some((task: any) => isTaskOverdue(task))) return "tiene tareas vencidas";
  if (project.status === "frozen" || project.isFrozen) return "congelado para reducir frentes";
  if (project.status === "active") return "frente activo";
  return labels[project.status] || "frente registrado";
}

function getProjectTone(project: any): ProjectTone {
  if (project.status === "blocked" || (project.tasks || []).some((task: any) => task.status === "blocked" || isTaskOverdue(task))) return "critical";
  if (needsNextAction(project) || project.priority === "critical" || project.priority === "high") return "high";
  if (project.status === "active") return "medium";
  if (project.status === "completed") return "low";
  return "info";
}

function sideBorder(tone: ProjectTone) {
  if (tone === "critical") return "border-l-red-500";
  if (tone === "high") return "border-l-orange-500";
  if (tone === "medium") return "border-l-blue-500";
  if (tone === "low") return "border-l-emerald-500";
  return "border-l-slate-400";
}

function topBorder(tone: ProjectTone) {
  if (tone === "critical") return "border-t-red-400";
  if (tone === "high") return "border-t-orange-400";
  if (tone === "medium") return "border-t-blue-400";
  if (tone === "low") return "border-t-emerald-400";
  return "border-t-slate-300";
}

function toneBubble(tone: ProjectTone) {
  if (tone === "critical") return "bg-red-50 text-red-700 ring-red-100";
  if (tone === "high") return "bg-orange-50 text-orange-700 ring-orange-100";
  if (tone === "medium") return "bg-blue-50 text-blue-700 ring-blue-100";
  if (tone === "low") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-slate-50 text-slate-600 ring-slate-100";
}

function toneText(tone: ProjectTone) {
  if (tone === "critical") return "text-red-700";
  if (tone === "high") return "text-orange-700";
  if (tone === "medium") return "text-blue-700";
  if (tone === "low") return "text-emerald-700";
  return "text-slate-700";
}

function tonePill(tone: ProjectTone) {
  if (tone === "critical") return "border-red-200 bg-red-50 text-red-700";
  if (tone === "high") return "border-orange-200 bg-orange-50 text-orange-700";
  if (tone === "medium") return "border-blue-200 bg-blue-50 text-blue-700";
  if (tone === "low") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function filterTitle(active: ProjectFilter) {
  const titles: Record<ProjectFilter, string> = {
    attention: "Requieren atención",
    active: "Activos",
    blocked: "Bloqueados",
    missing_next: "Sin próxima acción",
    frozen: "Congelados",
    production: "Producción / mantenimiento",
    completed: "Completados",
    all: "Todos los proyectos",
  };
  return titles[active];
}
