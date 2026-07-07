"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock3, Focus, Lock, RotateCcw, Save, Search, Target } from "lucide-react";
import { saveWeeklyFocus } from "@/actions/focus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Status, TextWithLinks, days, fmt } from "@/components/workspace";

type Tone = "critical" | "high" | "medium" | "low" | "info";

type Area = { id: string; name: string; status: string };
type Project = {
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
  area: { id: string; name: string } | null;
};
type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  isToday: boolean;
  isCritical: boolean;
  area: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
};
type FocusData = {
  weekStartDate: string;
  weekEndDate: string;
  areas: Area[];
  projects: Project[];
  tasks: Task[];
  focus: {
    id: string;
    mainProjectId: string | null;
    weeklyGoal: string | null;
    notes: string | null;
    secondaryProjectIds: string[];
    avoidProjectIds: string[];
  } | null;
};

const tone = {
  critical: { rail: "border-l-red-500", dot: "bg-red-500", soft: "border-red-200 bg-red-50 text-red-700", text: "text-red-700" },
  high: { rail: "border-l-orange-500", dot: "bg-orange-500", soft: "border-orange-200 bg-orange-50 text-orange-700", text: "text-orange-700" },
  medium: { rail: "border-l-blue-500", dot: "bg-blue-500", soft: "border-blue-200 bg-blue-50 text-blue-700", text: "text-blue-700" },
  low: { rail: "border-l-emerald-500", dot: "bg-emerald-500", soft: "border-emerald-200 bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
  info: { rail: "border-l-slate-400", dot: "bg-slate-400", soft: "border-slate-200 bg-slate-50 text-slate-600", text: "text-slate-700" },
} satisfies Record<Tone, Record<string, string>>;

export function FocusView({ data }: { data: FocusData }) {
  const [mainProjectId, setMainProjectId] = useState(data.focus?.mainProjectId || "");
  const [secondaryProjectIds, setSecondaryProjectIds] = useState<string[]>(data.focus?.secondaryProjectIds || []);
  const [avoidProjectIds, setAvoidProjectIds] = useState<string[]>(data.focus?.avoidProjectIds || []);
  const [weeklyGoal, setWeeklyGoal] = useState(data.focus?.weeklyGoal || "");
  const [notes, setNotes] = useState(data.focus?.notes || "");
  const [areaFilter, setAreaFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedProjectIds = useMemo(() => [mainProjectId, ...secondaryProjectIds].filter(Boolean), [mainProjectId, secondaryProjectIds]);
  const mainProject = data.projects.find((project) => project.id === mainProjectId) || null;
  const secondaryProjects = data.projects.filter((project) => secondaryProjectIds.includes(project.id));
  const avoidProjects = data.projects.filter((project) => avoidProjectIds.includes(project.id));
  const focusTasks = data.tasks.filter((task) => task.project?.id && selectedProjectIds.includes(task.project.id)).sort(sortTasks);
  const weekTasks = data.tasks.filter((task) => task.dueDate && days(task.dueDate) >= -7 && days(task.dueDate) <= 7).sort(sortTasks);
  const projectOptions = filterProjects(data.projects, areaFilter, search);
  const risks = buildRisks(mainProject, secondaryProjects, avoidProjects, focusTasks, data.projects);
  const health = getFocusHealth(risks, mainProject);

  function toggle(list: string[], setter: (value: string[]) => void, id: string) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function save() {
    setMessage("");
    startTransition(async () => {
      try {
        const result = await saveWeeklyFocus({
          id: data.focus?.id,
          weekStartDate: data.weekStartDate,
          weekEndDate: data.weekEndDate,
          mainProjectId: mainProjectId || null,
          secondaryProjectIds,
          avoidProjectIds,
          weeklyGoal,
          notes,
        });
        setMessage(result.success ? "Foco semanal guardado." : "No se pudo guardar.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No se pudo guardar el foco semanal.");
      }
    });
  }

  function reset() {
    setMainProjectId(data.focus?.mainProjectId || "");
    setSecondaryProjectIds(data.focus?.secondaryProjectIds || []);
    setAvoidProjectIds(data.focus?.avoidProjectIds || []);
    setWeeklyGoal(data.focus?.weeklyGoal || "");
    setNotes(data.focus?.notes || "");
    setMessage("");
  }

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-7">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium text-slate-600">Foco semanal</span>
            <ArrowRight className="size-3.5 text-slate-300" />
            <span className="font-semibold text-slate-950">{formatWeek(data.weekStartDate, data.weekEndDate)}</span>
            <Badge variant="outline" className={`ml-1 h-6 rounded-full ${tone[health.tone].soft}`}>{health.label}</Badge>
            {message ? <span className="ml-2 text-xs text-slate-500">{message}</span> : null}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={reset} disabled={isPending}><RotateCcw className="size-3.5" />Reset</Button>
              <Button size="sm" className="h-8 rounded-lg bg-slate-950 hover:bg-slate-800" onClick={save} disabled={isPending}><Save className="size-3.5" />{isPending ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-12rem)] md:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50/70 p-3 md:border-b-0 md:border-r">
              <div className={`rounded-xl border border-l-4 ${tone[health.tone].rail} bg-white p-3`}>
                <div className="flex items-center gap-2"><Focus className={`size-4 ${tone[health.tone].text}`} /><p className="text-sm font-semibold text-slate-950">Regla de foco</p></div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Un frente principal, pocos secundarios y una lista clara de proyectos a evitar.</p>
              </div>

              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Objetivo semanal</span>
                  <textarea value={weeklyGoal} onChange={(event) => setWeeklyGoal(event.target.value)} placeholder="Resultado concreto que define una buena semana" className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Notas de dirección</span>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Criterios, límites, decisiones o contexto" className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400" />
                </label>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Filtros de proyectos</p>
                <div className="grid gap-2">
                  <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-slate-400">
                    <option value="all">Todas las áreas</option>
                    {data.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                  </select>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proyecto" className="h-9 rounded-lg bg-white pl-9" />
                  </div>
                </div>
              </div>
            </aside>

            <main className="p-3">
              <MetricStrip mainProject={mainProject} secondaryCount={secondaryProjectIds.length} avoidCount={avoidProjectIds.length} focusTasks={focusTasks} risks={risks} />

              <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_390px]">
                <section className="space-y-3">
                  <FocusProjectPanel title="Foco principal" empty="Elegí un proyecto principal para esta semana." projects={mainProject ? [mainProject] : []} selected={mainProjectId ? [mainProjectId] : []} mode="single" onSelect={(id) => { setMainProjectId(id); setSecondaryProjectIds((current) => current.filter((item) => item !== id)); setAvoidProjectIds((current) => current.filter((item) => item !== id)); }} />
                  <FocusProjectPanel title="Secundarios" empty="Sin frentes secundarios." projects={secondaryProjects} selected={secondaryProjectIds} mode="multi" onSelect={(id) => toggle(secondaryProjectIds, setSecondaryProjectIds, id)} />
                  <FocusProjectPanel title="No tocar esta semana" empty="Sin proyectos marcados para evitar." projects={avoidProjects} selected={avoidProjectIds} mode="multi" onSelect={(id) => toggle(avoidProjectIds, setAvoidProjectIds, id)} />
                  <ProjectPicker projects={projectOptions} selectedIds={[mainProjectId, ...secondaryProjectIds, ...avoidProjectIds].filter(Boolean)} onMain={(id) => { setMainProjectId(id); setSecondaryProjectIds((current) => current.filter((item) => item !== id)); setAvoidProjectIds((current) => current.filter((item) => item !== id)); }} onSecondary={(id) => toggle(secondaryProjectIds, setSecondaryProjectIds, id)} onAvoid={(id) => toggle(avoidProjectIds, setAvoidProjectIds, id)} />
                </section>

                <section className="space-y-3">
                  <RiskPanel risks={risks} />
                  <TaskPanel title="Tareas del foco" tasks={focusTasks.slice(0, 8)} empty="No hay tareas abiertas vinculadas al foco." />
                  <TaskPanel title="Presión de semana" tasks={weekTasks.slice(0, 6)} empty="No hay vencimientos cercanos." />
                </section>
              </div>
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricStrip({ mainProject, secondaryCount, avoidCount, focusTasks, risks }: { mainProject: Project | null; secondaryCount: number; avoidCount: number; focusTasks: Task[]; risks: ReturnType<typeof buildRisks> }) {
  const overdue = focusTasks.filter((task) => task.dueDate && days(task.dueDate) < 0).length;
  const blocked = focusTasks.filter((task) => ["blocked", "waiting"].includes(task.status)).length;
  const items = [
    { label: "Principal", value: mainProject ? "1" : "0", detail: mainProject?.name || "sin definir", tone: mainProject ? "low" : "critical", Icon: Target },
    { label: "Secundarios", value: secondaryCount, detail: secondaryCount > 3 ? "demasiados frentes" : "frentes de apoyo", tone: secondaryCount > 3 ? "high" : "medium", Icon: CheckCircle2 },
    { label: "No tocar", value: avoidCount, detail: "frentes protegidos", tone: avoidCount ? "info" : "medium", Icon: Lock },
    { label: "Presión", value: overdue + blocked, detail: "vencidas/bloqueadas", tone: overdue + blocked ? "critical" : "low", Icon: AlertTriangle },
    { label: "Riesgos", value: risks.length, detail: "señales de foco", tone: risks.length ? "high" : "low", Icon: Clock3 },
  ] as const;

  return <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{items.map(({ label, value, detail, tone: itemTone, Icon }) => <div key={label} className={`rounded-xl border border-l-4 ${tone[itemTone].rail} bg-white px-3 py-2.5 shadow-sm`}><div className="flex items-center gap-2"><Icon className={`size-4 ${tone[itemTone].text}`} /><span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">{label}</span></div><div className="mt-1 flex items-end gap-2"><span className={`text-xl font-semibold ${tone[itemTone].text}`}>{value}</span><span className="min-w-0 truncate text-[11px] text-slate-500">{detail}</span></div></div>)}</div>;
}

function FocusProjectPanel({ title, empty, projects, selected, mode, onSelect }: { title: string; empty: string; projects: Project[]; selected: string[]; mode: "single" | "multi"; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{projects.length}</Badge></div>
      <div className="divide-y divide-slate-100">
        {projects.length ? projects.map((project) => <ProjectRow key={project.id} project={project} selected={selected.includes(project.id)} actionLabel={mode === "single" ? "Cambiar" : selected.includes(project.id) ? "Quitar" : "Sumar"} onClick={() => onSelect(project.id)} />) : <div className="px-3 py-6 text-center text-sm text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function ProjectPicker({ projects, selectedIds, onMain, onSecondary, onAvoid }: { projects: Project[]; selectedIds: string[]; onMain: (id: string) => void; onSecondary: (id: string) => void; onAvoid: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"><h2 className="text-sm font-semibold text-slate-950">Banco de proyectos</h2><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{projects.length}</Badge></div>
      <div className="max-h-[420px] divide-y divide-slate-100 overflow-auto">
        {projects.map((project) => (
          <div key={project.id} className="grid grid-cols-[minmax(240px,1fr)_auto] items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
            <div className={`min-w-0 border-l-4 pl-2 ${tone[projectTone(project)].rail}`}><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={project.name} /></p>{selectedIds.includes(project.id) ? <Badge variant="outline" className="h-5 rounded-full bg-blue-50 px-2 text-[11px] text-blue-700">seleccionado</Badge> : null}</div><p className="mt-0.5 truncate text-xs text-slate-500">{project.area?.name || "Sin área"} · {project.nextAction || "sin próxima acción"}</p></div>
            <div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7" onClick={() => onMain(project.id)}>Principal</Button><Button size="sm" variant="ghost" className="h-7" onClick={() => onSecondary(project.id)}>Sec.</Button><Button size="sm" variant="ghost" className="h-7 text-slate-500" onClick={() => onAvoid(project.id)}>Evitar</Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project, selected, actionLabel, onClick }: { project: Project; selected: boolean; actionLabel: string; onClick: () => void }) {
  const itemTone = projectTone(project);
  return (
    <div className="grid grid-cols-[minmax(260px,1fr)_112px_100px] items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
      <div className={`min-w-0 border-l-4 pl-2 ${tone[itemTone].rail}`}><Link href={`/projects/${project.id}`} className="truncate text-sm font-semibold text-slate-950 hover:underline"><TextWithLinks value={project.name} /></Link><p className="mt-0.5 truncate text-xs text-slate-500">{project.area?.name || "Sin área"} · {project.nextAction || "sin próxima acción"}</p></div>
      <div className="flex flex-wrap gap-1"><Status value={project.status} /><Status value={project.priority} /></div>
      <Button variant={selected ? "outline" : "ghost"} size="sm" className="h-7 rounded-lg" onClick={onClick}>{actionLabel}</Button>
    </div>
  );
}

function RiskPanel({ risks }: { risks: ReturnType<typeof buildRisks> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"><h2 className="text-sm font-semibold text-slate-950">Riesgos de foco</h2><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{risks.length}</Badge></div>
      <div className="divide-y divide-slate-100">
        {risks.length ? risks.map((risk) => <div key={risk.text} className={`border-l-4 px-3 py-2.5 ${tone[risk.tone].rail}`}><p className={`text-sm font-semibold ${tone[risk.tone].text}`}>{risk.title}</p><p className="mt-0.5 text-xs text-slate-500">{risk.text}</p></div>) : <div className="px-3 py-6 text-center text-sm text-slate-500">No hay riesgos fuertes de foco.</div>}
      </div>
    </div>
  );
}

function TaskPanel({ title, tasks, empty }: { title: string; tasks: Task[]; empty: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><Badge variant="outline" className="h-5 rounded-full bg-white px-2 text-[11px]">{tasks.length}</Badge></div>
      <div className="divide-y divide-slate-100">
        {tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} />) : <div className="px-3 py-6 text-center text-sm text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const itemTone = taskTone(task);
  return <Link href="/tasks" className="grid grid-cols-[minmax(210px,1fr)_86px_90px] items-center gap-3 px-3 py-2.5 hover:bg-slate-50"><div className={`min-w-0 border-l-4 pl-2 ${tone[itemTone].rail}`}><p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={task.title} /></p><p className="mt-0.5 truncate text-xs text-slate-500">{task.project?.name || task.area?.name || "Inbox"}</p></div><Status value={task.status} /><span className="truncate text-xs text-slate-500">{task.dueDate ? fmt(task.dueDate) : "Sin fecha"}</span></Link>;
}

function filterProjects(projects: Project[], areaId: string, search: string) {
  const query = search.trim().toLowerCase();
  return projects.filter((project) => {
    if (areaId !== "all" && project.area?.id !== areaId) return false;
    if (!query) return true;
    return [project.name, project.area?.name, project.nextAction, project.status, project.priority].filter(Boolean).join(" ").toLowerCase().includes(query);
  });
}

function buildRisks(mainProject: Project | null, secondaryProjects: Project[], avoidProjects: Project[], focusTasks: Task[], allProjects: Project[]) {
  const risks: { title: string; text: string; tone: Tone }[] = [];
  if (!mainProject) risks.push({ title: "Sin principal", text: "La semana no tiene un frente rector.", tone: "critical" });
  if (mainProject?.status === "blocked") risks.push({ title: "Principal bloqueado", text: mainProject.blockedReason || "El foco principal está bloqueado.", tone: "critical" });
  if (mainProject && !mainProject.nextAction) risks.push({ title: "Sin próxima acción", text: "El proyecto principal no tiene una acción concreta definida.", tone: "high" });
  if (secondaryProjects.length > 3) risks.push({ title: "Demasiados secundarios", text: "Más de tres frentes secundarios diluyen la semana.", tone: "high" });
  if (!avoidProjects.length) risks.push({ title: "Sin lista de no tocar", text: "Conviene proteger la semana marcando frentes a evitar.", tone: "medium" });
  const overdue = focusTasks.filter((task) => task.dueDate && days(task.dueDate) < 0).length;
  if (overdue) risks.push({ title: "Tareas vencidas", text: `${overdue} tareas del foco están vencidas.`, tone: "critical" });
  const blocked = focusTasks.filter((task) => ["blocked", "waiting"].includes(task.status)).length;
  if (blocked) risks.push({ title: "Bloqueos de ejecución", text: `${blocked} tareas del foco están bloqueadas o esperando.`, tone: "high" });
  const activeProjects = allProjects.filter((project) => project.status === "active").length;
  if (activeProjects > 8) risks.push({ title: "Demasiados activos", text: `${activeProjects} proyectos activos compiten por atención.`, tone: "medium" });
  return risks;
}

function getFocusHealth(risks: ReturnType<typeof buildRisks>, mainProject: Project | null) {
  if (!mainProject) return { label: "Sin definir", tone: "critical" as Tone };
  if (risks.some((risk) => risk.tone === "critical")) return { label: "Crítico", tone: "critical" as Tone };
  if (risks.some((risk) => risk.tone === "high")) return { label: "Tenso", tone: "high" as Tone };
  if (risks.length) return { label: "Controlado", tone: "medium" as Tone };
  return { label: "Nítido", tone: "low" as Tone };
}

function sortTasks(a: Task, b: Task) {
  return taskScore(b) - taskScore(a) || taskDay(a) - taskDay(b);
}

function taskScore(task: Task) {
  return (task.status === "blocked" ? 60 : 0) + (task.dueDate && days(task.dueDate) < 0 ? 50 : 0) + (task.isCritical ? 40 : 0) + (task.priority === "critical" ? 30 : task.priority === "high" ? 20 : 0) + (task.isToday ? 15 : 0);
}

function taskDay(task: Task) {
  return task.dueDate ? days(task.dueDate) : 999;
}

function projectTone(project: Project): Tone {
  if (project.status === "blocked") return "critical";
  if (!project.nextAction || project.priority === "critical" || project.priority === "high") return "high";
  if (project.status === "active") return "medium";
  if (project.status === "completed") return "low";
  return "info";
}

function taskTone(task: Task): Tone {
  if (task.status === "blocked" || task.dueDate && days(task.dueDate) < 0) return "critical";
  if (task.status === "waiting" || task.priority === "critical" || task.priority === "high") return "high";
  if (task.isToday || task.status === "in_progress") return "medium";
  return "info";
}

function formatWeek(start: string, end: string) {
  return `${fmt(start)} → ${fmt(end)}`;
}
