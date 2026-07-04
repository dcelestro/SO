// @ts-nocheck
"use client";
/* eslint-disable react-hooks/purity -- fechas relativas calculadas contra el inicio de la sesiÃ³n */
import Link from "next/link";
import { useState } from "react";
import { useData } from "@/components/data-provider";
import type { Project, Task } from "@/lib/demo-data";
import {
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderKanban,
  Inbox,
  LayoutGrid,
  List,
  Pause,
  Play,
  Search,
  Snowflake,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  AttentionCard,
  ContextCard,
  DueDateBadge,
  HeroCard,
  OperationalCard,
  SectionHeader,
  SemanticBadge,
} from "@/components/visual-hierarchy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DesktopShell,
  DesktopWorkspace,
} from "@/components/desktop-shell";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export const labels: Record<string, string> = {
  active: "Activo",
  blocked: "Bloqueado",
  paused: "Pausado",
  completed: "Terminado",
  frozen: "Congelado",
  idea: "Idea",
  discarded: "Descartado",
  critical: "CrÃ­tica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
  pending: "Pendiente",
  in_progress: "En curso",
  inbox: "Inbox",
  waiting: "En espera",
  done: "Realizado",
  overdue: "Vencido",
  captured: "Capturada",
  evaluating: "Evaluando",
  future: "A futuro",
  converted_to_project: "Convertida",
  development: "Desarrollo",
  testing: "Pruebas",
  production: "ProducciÃ³n",
  validation: "ValidaciÃ³n",
  design: "DiseÃ±o",
  maintenance: "Mantenimiento",
  domain: "Dominio",
  hosting: "Hosting",
  backup: "Backup",
  license: "Licencia",
  repository: "Repositorio",
  server: "Servidor",
};
const TODAY = Date.now();
export const fmt = (v?: string | Date | null | undefined) =>
  v
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
      }).format(new Date(v))
    : "â€”";
export const days = (v: string | Date | null | undefined) => { if (!v) return 0; return Math.ceil((new Date(v).getTime() - TODAY) / 86400000); };
export function Status({ value }: { value: string }) {
  return (
    <SemanticBadge
      value={value}
      label={labels[value] || value.replaceAll("_", " ")}
    />
  );
}
export function Header({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
export function Workspace({ section, id }: { section: string; id?: string }) {
  if (section === "projects" && id) return <ProjectDetail id={id} />;

  if (section === "dashboard") return <DashboardV2 />;
  if (section === "desktop") return <Dashboard />;
  if (section === "projects") return <Projects />;
  if (section === "tasks") return <Tasks />;
  if (section === "focus") return <Focus />;
  if (section === "ecosystem") return <Ecosystem />;
  if (section === "freezer") return <Freezer />;
  if (section === "assets") return <Assets />;
  if (section === "ideas") return <Ideas />;
  if (section === "due-items") return <Dues />;
  if (section === "reviews") return <Reviews />;
  if (section === "kpis") return <Kpis />;
  if (section === "settings") return <Settings />;
  
  if (section === "alerts") return <AlertsPending />;
  if (section === "archive") return <ArchivePending />;

  return <UnknownSection section={section} />;
}

function LibraryPending() {
  return (
    <>
      <Header
        title="Biblioteca"
        desc="Repositorio de documentos, notas y referencias del ecosistema."
      />
      <Empty text="La ruta Biblioteca está conectada, pero no se encontró una pantalla de Biblioteca implementada en este branch." />
    </>
  );
}

function AlertsPending() {
  return (
    <>
      <Header
        title="Alertas"
        desc="Señales importantes del sistema y vencimientos que requieren atención."
      />
      <Empty text="Alertas todavía no tiene pantalla propia conectada. Esta ruta ya no redirige al Dashboard." />
    </>
  );
}

function ArchivePending() {
  return (
    <>
      <Header
        title="Archivo"
        desc="Elementos cerrados, archivados o fuera de operación activa."
      />
      <Empty text="Archivo todavía no tiene pantalla propia conectada. Esta ruta ya no redirige al Dashboard." />
    </>
  );
}

function UnknownSection({ section }: { section: string }) {
  return (
    <>
      <Header
        title="Pantalla no encontrada"
        desc={`La sección "${section}" no tiene una vista configurada.`}
      />
      <Empty text="Esta ruta no tiene una pantalla asociada. Revisá la navegación o agregá una vista explícita." />
    </>
  );
}

function Dashboard() {
  return (
    <DesktopShell>
      <DesktopWorkspace />
    </DesktopShell>
  );
}

function DashboardV2() {
  const { data } = useData();
  const focus = data.projects.find((p) => p.id === data.focus.mainProjectId);
  const focusIds = [
    data.focus.mainProjectId,
    ...data.focus.secondaryProjectIds,
  ];
  const openTasks = data.tasks.filter((t) => t.status !== "completed");
  const recommended = [...openTasks]
    .sort((a, b) => {
      const score = (t: Task) =>
        (t.projectId === data.focus.mainProjectId ? 8 : 0) +
        (t.dueDate && days(t.dueDate) <= 0 ? 7 : 0) +
        (t.priority === "critical" ? 6 : t.priority === "high" ? 3 : 0) +
        (t.status === "blocked" ? 5 : 0);
      return score(b) - score(a);
    })
    .slice(0, 5);
  const overdue = openTasks.filter((t) => t.dueDate && days(t.dueDate) < 0);
  const blocked = data.projects.filter((p) => p.status === "blocked");
  const noAction = data.projects.filter(
    (p) => p.status === "active" && !p.nextAction,
  );
  const inbox = data.tasks.filter((t) => t.status === "inbox");
  const dueSoon = data.dues.filter(
    (d) => d.status === "pending" && days(d.dueDate) <= 30,
  );
  return (
    <>
      <Header
        title="Buenos dÃ­as, Dario"
        desc="Tu centro de control priorizÃ³ lo que merece atenciÃ³n ahora."
      />
      <HeroCard
        eyebrow="Foco principal de la semana"
        title={focus?.name || "DefinÃ­ tu foco principal"}
        description={data.focus.weeklyGoal}
        icon={Target}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="sm"
            className="bg-white text-slate-950 hover:bg-slate-100"
          >
            <Link href={`/projects/${focus?.id}`}>
              Abrir proyecto <ArrowRight />
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            {data.focus.secondaryProjectIds.map((id) => (
              <SemanticBadge
                key={id}
                value="secondary"
                label={
                  data.projects.find((p) => p.id === id)?.name ||
                  "Foco secundario"
                }
              />
            ))}
          </div>
        </div>
      </HeroCard>

      <section className="mt-6 space-y-3">
        <SectionHeader
          eyebrow="Prioridad operativa"
          title="QuÃ© deberÃ­as hacer ahora"
          description="Ordenado por foco, urgencia, prioridad y bloqueos."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">
                Ver todas <ChevronRight />
              </Link>
            </Button>
          }
        />
        <AttentionCard tone="focus" icon={Zap} className="overflow-hidden">
          <div className="divide-y divide-blue-200/70">
            {recommended.map((task, index) => {
              const project = data.projects.find(
                (p) => p.id === task.projectId,
              );
              const reasons = [
                task.projectId === data.focus.mainProjectId && "Foco principal",
                task.dueDate && days(task.dueDate) < 0 && "Vencida",
                task.dueDate && days(task.dueDate) === 0 && "Vence hoy",
                task.priority === "critical" && "Prioridad crÃ­tica",
                task.priority === "high" && "Alta prioridad",
                task.status === "blocked" && "Bloqueante",
              ].filter(Boolean) as string[];
              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {project?.name || "Inbox"} Â·{" "}
                      {reasons.length
                        ? `Aparece porque: ${reasons.join(" Â· ")}`
                        : "Pendiente de procesar"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {reasons.slice(0, 2).map((r) => (
                      <SemanticBadge
                        key={r}
                        value={
                          r === "Vencida" || r === "Bloqueante"
                            ? "overdue"
                            : r.includes("Foco")
                              ? "focus"
                              : "high"
                        }
                        label={r}
                      />
                    ))}
                    <Status value={task.priority} />
                  </div>
                </div>
              );
            })}
          </div>
        </AttentionCard>
      </section>

      <section className="mt-7 space-y-3">
        <SectionHeader
          eyebrow="Riesgos y pendientes"
          title="AtenciÃ³n requerida"
          description="Estas seÃ±ales necesitan una decisiÃ³n, no solo una lectura."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AttentionCard
            tone="critical"
            icon={AlertCircle}
            title="Tareas vencidas"
            description={
              overdue.length
                ? `${overdue.length} requieren acciÃ³n inmediata`
                : "No hay tareas vencidas"
            }
          >
            <Link href="/tasks" className="text-sm font-semibold text-red-700">
              Revisar vencidas â†’
            </Link>
          </AttentionCard>
          <AttentionCard
            tone="warning"
            icon={AlertTriangle}
            title="Sin prÃ³xima acciÃ³n"
            description={
              noAction.length
                ? `${noAction.length} proyectos sin rumbo operativo`
                : "Todos tienen una acciÃ³n concreta"
            }
          >
            <Link
              href="/projects"
              className="text-sm font-semibold text-orange-700"
            >
              Tomar decisiÃ³n â†’
            </Link>
          </AttentionCard>
          <AttentionCard
            tone={blocked.length ? "critical" : "success"}
            icon={FolderKanban}
            title="Proyectos bloqueados"
            description={
              blocked.length
                ? `${blocked.length} frentes detenidos`
                : "No hay bloqueos activos"
            }
          >
            <Link href="/projects" className="text-sm font-semibold">
              Ver bloqueos â†’
            </Link>
          </AttentionCard>
          <AttentionCard
            tone="warning"
            icon={Inbox}
            title="Inbox sin procesar"
            description={
              inbox.length
                ? `${inbox.length} capturas necesitan contexto`
                : "Inbox procesado"
            }
          >
            <Link
              href="/tasks"
              className="text-sm font-semibold text-orange-700"
            >
              Procesar inbox â†’
            </Link>
          </AttentionCard>
        </div>
      </section>

      <section className="mt-7 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <OperationalCard
          title="PrÃ³ximos vencimientos"
          description="Lo mÃ¡s cercano primero; el color expresa el nivel de riesgo."
        >
          <div className="space-y-2">
            {dueSoon
              .sort((a, b) => days(a.dueDate) - days(b.dueDate))
              .slice(0, 5)
              .map((due) => (
                <div
                  key={due.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-3"
                >
                  <CalendarClock
                    className={
                      days(due.dueDate) < 0
                        ? "size-4 text-red-600"
                        : "size-4 text-orange-600"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {due.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.projects.find((p) => p.id === due.projectId)
                        ?.name || "General"}
                    </p>
                  </div>
                  <DueDateBadge days={days(due.dueDate)} />
                </div>
              ))}
          </div>
        </OperationalCard>
        <OperationalCard
          title="Contexto del sistema"
          description="SeÃ±ales de volumen, sin competir con la acciÃ³n."
        >
          <div className="grid grid-cols-2 gap-3">
            <ContextCard
              label="Frentes activos"
              value={data.projects.filter((p) => p.status === "active").length}
            />
            <ContextCard
              label="Dentro del foco"
              value={
                data.projects.filter((p) => focusIds.includes(p.id)).length
              }
            />
            <ContextCard label="Tareas abiertas" value={openTasks.length} />
            <ContextCard
              label="Ideas incubando"
              value={
                data.ideas.filter(
                  (i) =>
                    !["discarded", "converted_to_project"].includes(i.status),
                ).length
              }
            />
          </div>
        </OperationalCard>
      </section>
    </>
  );
}

/** Referencia visual anterior conservada durante esta iteraciÃ³n incremental. */
export function DashboardLegacy() {
  const { data } = useData(),
    now = Date.now(),
    focus = data.projects.find((p) => p.id === data.focus.mainProjectId),
    critical = data.tasks.filter(
      (t) =>
        t.status !== "completed" &&
        (t.isCritical ||
          t.priority === "critical" ||
          (t.dueDate && new Date(t.dueDate).getTime() <= now)),
    ),
    attention = data.projects.filter(
      (p) =>
        p.status === "blocked" ||
        (p.status === "active" && !p.nextAction) ||
        p.priority === "critical",
    ),
    upcoming = data.dues
      .filter((d) => d.status === "pending" && days(d.dueDate) <= 30)
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  return (
    <>
      <Header
        title="Buenos dÃ­as, Dario"
        desc="Esto es lo que merece tu atenciÃ³n hoy."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-slate-900 bg-slate-950 text-white xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400">
              <Target className="size-4 text-amber-400" />
              Foco principal de la semana
            </div>
            <CardTitle className="text-2xl">{focus?.name}</CardTitle>
            <CardDescription className="text-slate-300">
              {data.focus.weeklyGoal}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              size="sm"
              className="bg-white text-slate-950 hover:bg-slate-100"
            >
              <Link href={`/projects/${focus?.id}`}>
                Abrir proyecto <ArrowRight />
              </Link>
            </Button>
            <span className="ml-auto text-xs text-slate-400">
              Focos secundarios:{" "}
              {data.focus.secondaryProjectIds
                .map((i) => data.projects.find((p) => p.id === i)?.name)
                .join(" Â· ")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Progreso semanal</CardDescription>
            <CardTitle className="text-3xl">68%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={68} />
            <p className="mt-3 text-xs text-slate-500">
              3 de 5 tareas clave resueltas
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Tareas crÃ­ticas</CardTitle>
              <CardDescription>
                Vencidas, de hoy o de alta prioridad.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">
                Ver todas <ChevronRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {critical.slice(0, 5).map((t) => (
              <TaskLine key={t.id} task={t} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indicadores rÃ¡pidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Metric
              label="Proyectos activos"
              value={data.projects.filter((p) => p.status === "active").length}
            />
            <Metric
              label="Bloqueados"
              value={data.projects.filter((p) => p.status === "blocked").length}
              alert
            />
            <Metric
              label="Tareas abiertas"
              value={data.tasks.filter((t) => t.status !== "completed").length}
            />
            <Metric
              label="Vencidas"
              value={
                data.tasks.filter(
                  (t) =>
                    t.status !== "completed" &&
                    t.dueDate &&
                    days(t.dueDate) < 0,
                ).length
              }
              alert
            />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Proyectos que requieren atenciÃ³n
            </CardTitle>
            <CardDescription>
              Riesgo, bloqueo o ausencia de una acciÃ³n clara.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.slice(0, 5).map((p) => (
              <Link
                href={`/projects/${p.id}`}
                key={p.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50"
              >
                <div className="grid size-8 place-items-center rounded-md bg-slate-100">
                  <FolderKanban className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {p.status === "blocked"
                      ? "Proyecto bloqueado"
                      : p.nextAction || "Prioridad crÃ­tica"}
                  </p>
                </div>
                <Status value={p.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vencimientos prÃ³ximos</CardTitle>
            <CardDescription>Ventana de los prÃ³ximos 30 dÃ­as.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <CalendarClock
                  className={`size-4 ${days(d.dueDate) < 0 ? "text-red-500" : "text-amber-600"}`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {data.projects.find((p) => p.id === d.projectId)?.name ||
                      "General"}
                  </p>
                </div>
                <span className="text-xs font-medium">
                  {days(d.dueDate) < 0
                    ? `${Math.abs(days(d.dueDate))}d vencido`
                    : fmt(d.dueDate)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
export function Metric({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p
        className={`text-2xl font-semibold ${alert && value ? "text-red-600" : ""}`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
export function TaskLine({ task }: { task: Task }) {
  const { data, setData } = useData();
  const project = data.projects.find((p) => p.id === task.projectId);
  const isMainFocus = task.projectId === data.focus.mainProjectId;
  const isAvoided = data.focus.avoidProjectIds.includes(task.projectId || "");
  const isOverdue = Boolean(
    task.dueDate && days(task.dueDate) < 0 && task.status !== "completed",
  );
  const reason = isOverdue
    ? "Vencida: necesita resoluciÃ³n o una nueva fecha"
    : isMainFocus
      ? "Pertenece al foco principal de esta semana"
      : task.status === "blocked"
        ? "EstÃ¡ bloqueando el avance del proyecto"
        : isAvoided
          ? "Advertencia: este proyecto estÃ¡ marcado como no tocar"
          : task.priority === "critical"
            ? "Prioridad crÃ­tica"
            : task.status === "inbox"
              ? "Captura pendiente de procesar"
              : "Trabajo operativo pendiente";
  const toneClass =
    task.status === "completed"
      ? "border-l-emerald-500 bg-emerald-50/60"
      : isOverdue || task.status === "blocked"
        ? "border-l-red-500 bg-red-50/70"
        : isMainFocus
          ? "border-l-blue-600 bg-blue-50/70"
          : task.priority === "critical" || task.priority === "high"
            ? "border-l-orange-500 bg-orange-50/60"
            : isAvoided
              ? "border-l-amber-400 bg-amber-50/50"
              : "border-l-slate-200 bg-white";
  function update(status: string) {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status } : t)),
    }));
    void fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }
  return (
    <div
      className={`group flex flex-col gap-3 rounded-lg border border-l-4 border-y-slate-200 border-r-slate-200 px-3 py-3 transition hover:shadow-sm sm:flex-row sm:items-center ${toneClass}`}
    >
      <button
        onClick={() => update("completed")}
        className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-slate-300 bg-white hover:border-emerald-500 sm:mt-0"
        aria-label="Completar tarea"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            {task.title}
          </p>
          {isMainFocus && (
            <SemanticBadge value="focus" label="Foco principal" />
          )}
          {isAvoided && <SemanticBadge value="avoid" label="Fuera de foco" />}
          {isOverdue && <SemanticBadge value="overdue" label="Vencida" />}
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">
          {project?.name || "Inbox"} Â· {reason}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Status value={task.priority} />
        {task.dueDate && (
          <DueDateBadge
            days={days(task.dueDate)}
            done={task.status === "completed"}
          />
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            update(task.status === "in_progress" ? "completed" : "in_progress")
          }
        >
          {task.status === "in_progress" ? "Completar" : "Iniciar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-500"
          onClick={() => update("waiting")}
        >
          Posponer
        </Button>
      </div>
    </div>
  );
}
function Projects() {
  const { data } = useData();
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [view, setView] = useState("table");
  const rows = data.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || p.status === status),
  );
  return (
    <>
      <Header
        title="Proyectos"
        desc="Todos tus frentes, con estado y prÃ³xima acciÃ³n visibles."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Buscar proyecto..."
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {["active", "blocked", "paused", "frozen", "completed"].map((s) => (
              <SelectItem key={s} value={s}>
                {labels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-md border p-1">
          <Button
            size="icon"
            variant={view === "table" ? "secondary" : "ghost"}
            onClick={() => setView("table")}
          >
            <List />
          </Button>
          <Button
            size="icon"
            variant={view === "cards" ? "secondary" : "ghost"}
            onClick={() => setView("cards")}
          >
            <LayoutGrid />
          </Button>
        </div>
      </div>
      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Ãrea</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="min-w-64">PrÃ³xima acciÃ³n</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const inFocus = [
                  data.focus.mainProjectId,
                  ...data.focus.secondaryProjectIds,
                ].includes(p.id);
                const outOfFocusActive =
                  !inFocus &&
                  data.tasks.some(
                    (t) =>
                      t.projectId === p.id &&
                      !["completed", "discarded"].includes(t.status),
                  );
                return (
                  <TableRow
                    key={p.id}
                    className={
                      p.status === "blocked"
                        ? "bg-red-50/60"
                        : p.status === "frozen"
                          ? "bg-slate-50 text-slate-500"
                          : p.status === "active" && !p.nextAction
                            ? "bg-orange-50/60"
                            : ""
                    }
                  >
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          className="font-semibold text-slate-950 hover:underline"
                          href={`/projects/${p.id}`}
                        >
                          {p.name}
                        </Link>
                        {inFocus && (
                          <SemanticBadge
                            value={
                              p.id === data.focus.mainProjectId
                                ? "focus"
                                : "secondary"
                            }
                            label={
                              p.id === data.focus.mainProjectId
                                ? "Foco principal"
                                : "Foco"
                            }
                          />
                        )}{" "}
                        {outOfFocusActive && (
                          <SemanticBadge value="avoid" label="Fuera de foco" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Actualizado {fmt(p.updatedAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {data.areas.find((a) => a.id === p.areaId)?.name}
                    </TableCell>
                    <TableCell>
                      <Status value={p.status} />
                    </TableCell>
                    <TableCell>
                      <Status value={p.priority} />
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        PrÃ³xima acciÃ³n
                      </p>
                      <p
                        className={`mt-1 font-medium ${p.status === "active" && !p.nextAction ? "text-orange-700" : "text-slate-800"}`}
                      >
                        {p.nextAction || "Definir una prÃ³xima acciÃ³n concreta"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={p.progressPercentage}
                          className="w-20"
                        />
                        <span className="text-xs">{p.progressPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
function ProjectCard({ project: p }: { project: Project }) {
  const { data } = useData();
  const inFocus = [
    data.focus.mainProjectId,
    ...data.focus.secondaryProjectIds,
  ].includes(p.id);
  const needsAction = p.status === "active" && !p.nextAction;
  return (
    <Link href={`/projects/${p.id}`}>
      <Card
        className={`h-full border-l-4 transition hover:-translate-y-0.5 hover:shadow-md ${p.status === "blocked" ? "border-l-red-500 bg-red-50/40" : needsAction ? "border-l-orange-500 bg-orange-50/40" : p.status === "frozen" ? "border-l-slate-400 bg-slate-50" : "border-l-blue-500"}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="grid size-9 place-items-center rounded-lg bg-slate-100">
              <FolderKanban className="size-4" />
            </div>
            <div className="flex gap-2">
              {inFocus && (
                <SemanticBadge
                  value={
                    p.id === data.focus.mainProjectId ? "focus" : "secondary"
                  }
                  label="Foco"
                />
              )}
              <Status value={p.status} />
            </div>
          </div>
          <CardTitle className="pt-2 text-base">{p.name}</CardTitle>
          <CardDescription>
            {data.areas.find((a) => a.id === p.areaId)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`mb-4 min-h-16 rounded-lg p-3 ${needsAction ? "bg-orange-100/70" : "bg-slate-50"}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              PrÃ³xima acciÃ³n
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${needsAction ? "text-orange-800" : "text-slate-900"}`}
            >
              {p.nextAction || "Definir una prÃ³xima acciÃ³n concreta"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={p.progressPercentage} />
            <span className="text-xs">{p.progressPercentage}%</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
function Tasks() {
  const { data, setData } = useData();
  const [tab, setTab] = useState("today");
  const filtered =
    tab === "today"
      ? data.tasks.filter(
          (t) =>
            t.isToday || t.isCritical || (t.dueDate && days(t.dueDate) <= 0),
        )
      : tab === "inbox"
        ? data.tasks.filter((t) => t.status === "inbox")
        : data.tasks;
  const columns = ["pending", "in_progress", "blocked", "completed"];
  return (
    <>
      <Header
        title="Tareas"
        desc="Una lista liviana para ejecutar, no para administrar la administraciÃ³n."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        {tab !== "kanban" ? (
          <Card className="mt-4">
            <CardContent className="pt-4">
              {filtered.length ? (
                filtered.map((t) => <TaskLine key={t.id} task={t} />)
              ) : (
                <Empty text="No hay tareas en esta vista." />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {columns.map((c) => (
              <div key={c} className="rounded-xl bg-slate-100 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">{labels[c]}</p>
                  <Badge variant="secondary">
                    {data.tasks.filter((t) => t.status === c).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {data.tasks
                    .filter((t) => t.status === c)
                    .map((t) => (
                      <Card key={t.id}>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">{t.title}</p>
                          <p className="my-2 text-xs text-slate-500">
                            {data.projects.find((p) => p.id === t.projectId)
                              ?.name || "Inbox"}
                          </p>
                          <Select
                            value={t.status}
                            onValueChange={(v) =>
                              setData((d) => ({
                                ...d,
                                tasks: d.tasks.map((x) =>
                                  x.id === t.id ? { ...x, status: v } : x,
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {columns.map((x) => (
                                <SelectItem key={x} value={x}>
                                  {labels[x]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tabs>
    </>
  );
}
function Focus() {
  const { data } = useData(),
    main = data.projects.find((p) => p.id === data.focus.mainProjectId),
    secondary = data.projects.filter((p) =>
      data.focus.secondaryProjectIds.includes(p.id),
    ),
    avoid = data.projects.filter((p) =>
      data.focus.avoidProjectIds.includes(p.id),
    ),
    tasks = data.tasks.filter(
      (t) =>
        [data.focus.mainProjectId, ...data.focus.secondaryProjectIds].includes(
          t.projectId || "",
        ) && t.status !== "completed",
    );
  return (
    <>
      <Header
        title="Foco semanal"
        desc="Decidir quÃ© no hacer tambiÃ©n es una decisiÃ³n de producto."
      />
      <HeroCard
        eyebrow="Foco principal"
        title={main?.name || "DefinÃ­ tu foco"}
        description={data.focus.weeklyGoal}
        icon={Target}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Objetivo de la semana
            </p>
            <p className="mt-2 text-sm text-slate-200">{data.focus.notes}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-end justify-between">
              <span className="text-xs text-slate-400">Avance semanal</span>
              <b className="text-2xl">68%</b>
            </div>
            <Progress value={68} className="mt-3 bg-white/10" />
          </div>
        </div>
      </HeroCard>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <FocusBlock
          title="Foco principal"
          icon={<Target className="text-amber-500" />}
          projects={main ? [main] : []}
          tone="focus"
        />
        <FocusBlock
          title="Focos secundarios"
          icon={<TrendingUp className="text-blue-500" />}
          projects={secondary}
          tone="operation"
        />
        <FocusBlock
          title="No tocar esta semana"
          icon={<Pause className="text-slate-500" />}
          projects={avoid}
          tone="muted"
        />
      </div>
      <OperationalCard
        className="mt-4"
        title="Trabajo operativo del foco"
        description="Estas tareas sostienen el objetivo semanal."
      >
        <div className="space-y-2">
          {tasks.map((t) => (
            <TaskLine key={t.id} task={t} />
          ))}
        </div>
      </OperationalCard>
    </>
  );
}
function FocusBlock({
  title,
  icon,
  projects,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  projects: Project[];
  tone: "focus" | "operation" | "muted";
}) {
  return (
    <Card
      className={`border-l-4 shadow-none ${tone === "focus" ? "border-l-blue-600 bg-blue-50/60" : tone === "muted" ? "border-l-slate-400 bg-slate-50" : "border-l-blue-300 bg-white"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.map((p) => (
          <Link
            href={`/projects/${p.id}`}
            key={p.id}
            className="flex items-center justify-between rounded-lg border bg-white/70 p-3 text-sm font-semibold hover:bg-white"
          >
            {p.name}
            <ChevronRight className="size-4" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
function Ecosystem() {
  const { data } = useData();
  const [filter, setFilter] = useState("all");
  return (
    <>
      <Header
        title="Mapa del ecosistema"
        desc="Ãreas y proyectos como un sistema, no como una lista infinita."
        action={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {["active", "blocked", "frozen", "completed"].map((s) => (
                <SelectItem key={s} value={s}>
                  {labels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {data.areas.map((a) => {
          const ps = data.projects.filter(
            (p) =>
              p.areaId === a.id && (filter === "all" || p.status === filter),
          );
          return (
            <Card key={a.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: a.color }}
                  />
                  <CardTitle className="text-base">{a.name}</CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {ps.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {ps.map((p) => (
                  <Link
                    href={`/projects/${p.id}`}
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
                  >
                    <span
                      className={`size-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : p.status === "blocked" ? "bg-red-500" : p.status === "frozen" ? "bg-slate-300" : "bg-amber-400"}`}
                    />
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      {p.progressPercentage}%
                    </span>
                  </Link>
                ))}
                {!ps.length && (
                  <p className="py-5 text-center text-xs text-slate-400">
                    Sin proyectos en este filtro
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
function Freezer() {
  const { data, setData } = useData(),
    items = data.projects.filter((p) => p.isFrozen || p.status === "frozen");
  return (
    <>
      <Header
        title="Congelador"
        desc="Proyectos pausados conscientemente para recuperar atenciÃ³n."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <Card
            key={p.id}
            className="border-l-4 border-l-slate-400 bg-slate-50/80 shadow-none"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-lg bg-slate-100">
                  <Snowflake className="size-5 text-slate-500" />
                </div>
                <Status value="frozen" />
              </div>
              <CardTitle className="pt-3 text-lg">{p.name}</CardTitle>
              <CardDescription>
                {data.areas.find((a) => a.id === p.areaId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg border border-slate-200 bg-white/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Motivo del congelamiento
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {p.frozenReason}
                </p>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-slate-500">
                    Fecha de revisiÃ³n
                  </span>
                  <SemanticBadge value="frozen" label={fmt(p.frozenUntil)} />
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Play />
                    Reactivar proyecto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Â¿Reactivar {p.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se reactivarÃ¡ como pausado para que puedas definir una
                      prÃ³xima acciÃ³n antes de marcarlo activo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          projects: d.projects.map((x) =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  isFrozen: false,
                                  status: "paused",
                                  frozenReason: undefined,
                                }
                              : x,
                          ),
                        }))
                      }
                    >
                      Reactivar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
function Assets() {
  const { data } = useData();
  return (
    <>
      <Header
        title="Activos digitales"
        desc="DÃ³nde estÃ¡ cada recurso importante, sin guardar contraseÃ±as."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Acceso</TableHead>
              <TableHead>RenovaciÃ³n</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.assets.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>
                  {data.projects.find((p) => p.id === a.projectId)?.name ||
                    "General"}
                </TableCell>
                <TableCell>
                  <Status value={a.type} />
                </TableCell>
                <TableCell>{a.provider || "â€”"}</TableCell>
                <TableCell>
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      Abrir <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    a.passwordManagerReference || "â€”"
                  )}
                </TableCell>
                <TableCell>{fmt(a.renewalDate)}</TableCell>
                <TableCell>
                  <Status value={a.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <p className="mt-3 text-xs text-slate-500">
        Seguridad: Nexo solo registra referencias al gestor de contraseÃ±as.
        Nunca almacena la contraseÃ±a.
      </p>
    </>
  );
}
function Ideas() {
  const { data, setData } = useData();
  return (
    <>
      <Header
        title="Incubadora de ideas"
        desc="Capturar no significa comprometerse. EvaluÃ¡ antes de abrir otro frente."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.ideas.map((i) => (
          <Card
            key={i.id}
            className={`shadow-none ${i.status === "evaluating" ? "border-blue-200 bg-blue-50/30" : i.status === "converted_to_project" ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/40"}`}
          >
            <CardHeader>
              <div className="flex justify-between">
                <Status value={i.status} />
                <span className="text-xs text-slate-400">
                  Revisar {fmt(i.reviewDate)}
                </span>
              </div>
              <CardTitle className="pt-2 text-base font-semibold text-slate-800">
                {i.title}
              </CardTitle>
              <CardDescription>{i.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2 text-xs">
                <span>
                  Potencial <b>{labels[i.potential]}</b>
                </span>
                <span>Â·</span>
                <span>
                  Complejidad <b>{labels[i.complexity]}</b>
                </span>
              </div>
              {i.status !== "converted_to_project" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const id = `p-${Date.now()}`;
                    setData((d) => ({
                      ...d,
                      projects: [
                        {
                          id,
                          name: i.title,
                          description: i.description || "",
                          areaId: i.areaId || d.areas[0].id,
                          status: "idea",
                          priority: i.potential,
                          maturity: "idea",
                          projectType: "other",
                          progressPercentage: 0,
                          updatedAt: new Date().toISOString(),
                        },
                        ...d.projects,
                      ],
                      ideas: d.ideas.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              status: "converted_to_project",
                              projectId: id,
                            }
                          : x,
                      ),
                    }));
                  }}
                >
                  Convertir en proyecto <ArrowRight />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
function Dues() {
  const { data, setData } = useData(),
    groups = [
      {
        t: "Vencidos",
        test: (n: number) => n < 0,
        style: "border-l-red-500 bg-red-50/70",
        icon: "text-red-600",
      },
      {
        t: "PrÃ³ximos 7 dÃ­as",
        test: (n: number) => n >= 0 && n <= 7,
        style: "border-l-orange-500 bg-orange-50/70",
        icon: "text-orange-600",
      },
      {
        t: "PrÃ³ximos 30 dÃ­as",
        test: (n: number) => n > 7 && n <= 30,
        style: "border-l-amber-400 bg-amber-50/50",
        icon: "text-amber-600",
      },
      {
        t: "MÃ¡s adelante",
        test: (n: number) => n > 30,
        style: "border-l-slate-300 bg-slate-50/60",
        icon: "text-slate-500",
      },
      {
        t: "Completados",
        test: (_n: number) => true,
        style: "border-l-emerald-500 bg-emerald-50/60",
        icon: "text-emerald-600",
        done: true,
      },
    ];
  return (
    <>
      <Header
        title="Centro de vencimientos"
        desc="Dominios, servicios, pagos y controles antes de que se vuelvan urgentes."
      />
      {groups.map((g) => {
        const xs = data.dues.filter(
          (d) =>
            (g.done ? d.status === "done" : d.status === "pending") &&
            g.test(days(d.dueDate)),
        );
        return (
          <Card className={`mb-4 border-l-4 shadow-none ${g.style}`} key={g.t}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {g.t}
                <Badge variant="secondary">{xs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {xs.length ? (
                xs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 border-t py-3 first:border-0"
                  >
                    <CalendarClock className={`size-5 ${g.icon}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-950">
                        {d.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {data.projects.find((p) => p.id === d.projectId)
                          ?.name || "General"}{" "}
                        Â· {labels[d.type] || d.type}
                      </p>
                    </div>
                    {d.amount && (
                      <span className="text-sm">
                        {d.currency} {d.amount}
                      </span>
                    )}
                    <div className="flex flex-col items-end gap-1">
                      <DueDateBadge days={days(d.dueDate)} done={g.done} />
                      <span className="text-xs text-slate-500">
                        {fmt(d.dueDate)}
                      </span>
                    </div>
                    {!g.done && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setData((x) => ({
                            ...x,
                            dues: x.dues.map((y) =>
                              y.id === d.id ? { ...y, status: "done" } : y,
                            ),
                          }));
                          void fetch(`/api/due-items/${d.id}/mark-done`, {
                            method: "POST",
                          });
                        }}
                      >
                        <Check />
                        Listo
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Nada en esta ventana.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
function Reviews() {
  const { data, setData } = useData();
  const groups = [
    {
      t: "Vencidas",
      xs: data.reviews.filter(
        (r) => r.status === "pending" && days(r.nextReviewDate) < 0,
      ),
    },
    {
      t: "Esta semana",
      xs: data.reviews.filter(
        (r) =>
          r.status === "pending" &&
          days(r.nextReviewDate) >= 0 &&
          days(r.nextReviewDate) <= 7,
      ),
    },
    {
      t: "PrÃ³ximas",
      xs: data.reviews.filter(
        (r) => r.status === "pending" && days(r.nextReviewDate) > 7,
      ),
    },
    { t: "Completadas", xs: data.reviews.filter((r) => r.status === "done") },
  ];
  return (
    <>
      <Header
        title="Revisiones periÃ³dicas"
        desc="Un sistema confiable tambiÃ©n revisa lo que parece estar funcionando."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <Card
            key={g.t}
            className={`border-l-4 shadow-none ${g.t === "Vencidas" ? "border-l-red-500 bg-red-50/60" : g.t === "Esta semana" ? "border-l-orange-500 bg-orange-50/50" : g.t === "Completadas" ? "border-l-emerald-500 bg-emerald-50/50" : "border-l-slate-300"}`}
          >
            <CardHeader>
              <CardTitle className="text-base">{g.t}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {g.xs.length ? (
                g.xs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Clock3
                      className={`size-4 ${g.t === "Vencidas" ? "text-red-600" : g.t === "Completadas" ? "text-emerald-600" : "text-slate-500"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-slate-500">
                        {labels[r.type] || r.type.replaceAll("_", " ")} Â·{" "}
                        {fmt(r.nextReviewDate)}
                      </p>
                    </div>
                    {r.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            reviews: d.reviews.map((x) =>
                              x.id === r.id
                                ? {
                                    ...x,
                                    status: "done",
                                    lastReviewDate: new Date().toISOString(),
                                  }
                                : x,
                            ),
                          }))
                        }
                      >
                        <CheckCircle2 />
                        Realizada
                      </Button>
                    ) : (
                      <Status value="done" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Sin revisiones.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
function Kpis() {
  return <KpisV2 />;
}
function KpisV2() {
  const { data } = useData();
  const mainFocus = data.focus.mainProjectId;
  const focusIds = [mainFocus, ...data.focus.secondaryProjectIds];
  const critical = [
    {
      l: "Proyectos sin prÃ³xima acciÃ³n",
      v: data.projects.filter((p) => p.status === "active" && !p.nextAction)
        .length,
    },
    {
      l: "Tareas vencidas",
      v: data.tasks.filter(
        (t) => t.status !== "completed" && t.dueDate && days(t.dueDate) < 0,
      ).length,
    },
    {
      l: "Vencimientos vencidos",
      v: data.dues.filter((d) => d.status === "pending" && days(d.dueDate) < 0)
        .length,
    },
    {
      l: "Proyectos bloqueados",
      v: data.projects.filter((p) => p.status === "blocked").length,
    },
  ];
  const focus = [
    {
      l: "Frentes activos",
      v: data.projects.filter((p) => p.status === "active").length,
    },
    {
      l: "Proyectos dentro del foco",
      v: data.projects.filter((p) => focusIds.includes(p.id)).length,
    },
    {
      l: "Fuera de foco con actividad",
      v: data.projects.filter(
        (p) =>
          !focusIds.includes(p.id) &&
          data.tasks.some(
            (t) => t.projectId === p.id && t.status !== "completed",
          ),
      ).length,
    },
  ];
  const info = [
    { l: "Ideas en incubadora", v: data.ideas.length },
    { l: "Activos registrados", v: data.assets.length },
    {
      l: "Tareas completadas",
      v: data.tasks.filter((t) => t.status === "completed").length,
    },
    {
      l: "Proyectos congelados",
      v: data.projects.filter((p) => p.status === "frozen").length,
    },
  ];
  return (
    <>
      <Header
        title="Indicadores personales"
        desc="Primero las seÃ±ales que exigen una decisiÃ³n; despuÃ©s el contexto."
      />
      <section className="space-y-3">
        <SectionHeader
          eyebrow="SeÃ±ales crÃ­ticas"
          title="Lo que puede frenar tu sistema"
          description="Valores distintos de cero requieren atenciÃ³n."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {critical.map((x) => (
            <AttentionCard
              key={x.l}
              tone={x.v ? "critical" : "success"}
              icon={x.v ? AlertCircle : CheckCircle2}
              title={x.l}
            >
              <p
                className={`text-3xl font-semibold ${x.v ? "text-red-700" : "text-emerald-700"}`}
              >
                {x.v}
              </p>
            </AttentionCard>
          ))}
        </div>
      </section>
      <section className="mt-7 space-y-3">
        <SectionHeader
          eyebrow="SeÃ±ales de foco"
          title="CÃ³mo estÃ¡ distribuida tu atenciÃ³n"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {focus.map((x) => (
            <AttentionCard key={x.l} tone="focus" icon={Target} title={x.l}>
              <p className="text-3xl font-semibold text-blue-800">{x.v}</p>
            </AttentionCard>
          ))}
        </div>
      </section>
      <section className="mt-7 space-y-3">
        <SectionHeader
          eyebrow="Contexto"
          title="Volumen general"
          description="InformaciÃ³n Ãºtil, sin competir con lo urgente."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {info.map((x) => (
            <ContextCard key={x.l} label={x.l} value={x.v} />
          ))}
        </div>
      </section>
    </>
  );
}
/** Referencia anterior de KPIs. */
export function KpisLegacy() {
  const { data } = useData();
  const values = [
    { l: "Proyectos totales", v: data.projects.length },
    {
      l: "Proyectos activos",
      v: data.projects.filter((p) => p.status === "active").length,
    },
    {
      l: "Proyectos bloqueados",
      v: data.projects.filter((p) => p.status === "blocked").length,
      bad: true,
    },
    {
      l: "Proyectos congelados",
      v: data.projects.filter((p) => p.status === "frozen").length,
    },
    {
      l: "Sin prÃ³xima acciÃ³n",
      v: data.projects.filter((p) => p.status === "active" && !p.nextAction)
        .length,
      bad: true,
    },
    {
      l: "Tareas pendientes",
      v: data.tasks.filter(
        (t) => !["completed", "discarded"].includes(t.status),
      ).length,
    },
    {
      l: "Tareas en curso",
      v: data.tasks.filter((t) => t.status === "in_progress").length,
    },
    {
      l: "Tareas vencidas",
      v: data.tasks.filter(
        (t) => t.status !== "completed" && t.dueDate && days(t.dueDate) < 0,
      ).length,
      bad: true,
    },
    {
      l: "Ideas en incubadora",
      v: data.ideas.filter((i) => i.status !== "discarded").length,
    },
    {
      l: "Vencimientos prÃ³ximos",
      v: data.dues.filter(
        (d) => d.status === "pending" && days(d.dueDate) <= 30,
      ).length,
    },
    {
      l: "Revisiones vencidas",
      v: data.reviews.filter(
        (r) => r.status === "pending" && days(r.nextReviewDate) < 0,
      ).length,
      bad: true,
    },
    { l: "Activos registrados", v: data.assets.length },
  ];
  return (
    <>
      <Header
        title="Indicadores personales"
        desc="SeÃ±ales simples para tomar decisiones, no analytics decorativo."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {values.map((x) => (
          <Card key={x.l}>
            <CardContent className="p-5">
              <p
                className={`text-3xl font-semibold ${x.bad && x.v ? "text-red-600" : "text-slate-950"}`}
              >
                {x.v}
              </p>
              <p className="mt-1 text-sm text-slate-500">{x.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Salud del ecosistema</CardTitle>
          <CardDescription>DistribuciÃ³n actual de proyectos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["active", "blocked", "paused", "frozen", "completed"].map((s) => {
            const n = data.projects.filter((p) => p.status === s).length;
            return (
              <div
                key={s}
                className="grid grid-cols-[110px_1fr_30px] items-center gap-3"
              >
                <span className="text-sm">{labels[s]}</span>
                <Progress value={(n / data.projects.length) * 100} />
                <span className="text-sm font-medium">{n}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
function ProjectDetail({ id }: { id: string }) {
  const { data, setData } = useData(),
    p = data.projects.find((x) => x.id === id);
  if (!p) return <Empty text="Proyecto no encontrado." />;
  const tasks = data.tasks.filter((t) => t.projectId === id),
    assets = data.assets.filter((a) => a.projectId === id),
    ideas = data.ideas.filter((i) => i.projectId === id),
    dues = data.dues.filter((d) => d.projectId === id),
    reviews = data.reviews.filter((r) => r.projectId === id);
  const isMainFocus = p.id === data.focus.mainProjectId;
  const isSecondaryFocus = data.focus.secondaryProjectIds.includes(p.id);
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && days(t.dueDate) < 0,
  );
  const upcomingDues = dues.filter(
    (d) => d.status === "pending" && days(d.dueDate) <= 30,
  );
  const health =
    p.status === "blocked" || overdueTasks.length
      ? "En riesgo"
      : !p.nextAction && p.status === "active"
        ? "Requiere decisiÃ³n"
        : "Saludable";
  const freeze = () =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "frozen",
              isFrozen: true,
              frozenReason: "Pausa consciente para reducir frentes abiertos",
              frozenUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
            }
          : x,
      ),
    }));
  return (
    <>
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-slate-950"
        >
          â† Volver a proyectos
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Status value={p.status} />
              <Status value={p.priority} />
              <Badge variant="outline">
                {labels[p.maturity] || p.maturity}
              </Badge>
              {(isMainFocus || isSecondaryFocus) && (
                <SemanticBadge
                  value={isMainFocus ? "focus" : "secondary"}
                  label={isMainFocus ? "Foco principal" : "Foco secundario"}
                />
              )}
              <SemanticBadge
                value={
                  health === "Saludable"
                    ? "completed"
                    : health === "En riesgo"
                      ? "overdue"
                      : "high"
                }
                label={`Salud: ${health}`}
              />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {p.description}
            </p>
          </div>
          {!p.isFrozen && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Snowflake />
                  Congelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Congelar proyecto</AlertDialogTitle>
                  <AlertDialogDescription>
                    El proyecto saldrÃ¡ de los activos y quedarÃ¡ en el
                    Congelador. Se registrarÃ¡ una revisiÃ³n dentro de 30 dÃ­as.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={freeze}>
                    Congelar proyecto
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <AttentionCard
          tone={!p.nextAction && p.status === "active" ? "warning" : "focus"}
          icon={Zap}
          title="PrÃ³xima acciÃ³n"
          description={
            !p.nextAction && p.status === "active"
              ? "Este proyecto activo necesita direcciÃ³n."
              : "El siguiente movimiento concreto del proyecto."
          }
          className="md:col-span-2"
        >
          <p
            className={`text-xl font-semibold ${!p.nextAction && p.status === "active" ? "text-orange-800" : "text-blue-950"}`}
          >
            {p.nextAction || "Definir una prÃ³xima acciÃ³n concreta"}
          </p>
          <Button variant="outline" size="sm" className="mt-4 bg-white/70">
            Ver tareas relacionadas <ArrowRight />
          </Button>
        </AttentionCard>
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <b>{p.progressPercentage}%</b>
            </div>
            <Progress className="mt-3" value={p.progressPercentage} />
          </CardContent>
        </Card>
      </div>
      {(p.status === "blocked" ||
        overdueTasks.length > 0 ||
        upcomingDues.length > 0) && (
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {p.status === "blocked" && (
            <AttentionCard
              tone="critical"
              icon={AlertCircle}
              title="Proyecto bloqueado"
              description="Necesita resolver el impedimento antes de avanzar."
            />
          )}
          {overdueTasks.length > 0 && (
            <AttentionCard
              tone="critical"
              icon={AlertTriangle}
              title={`${overdueTasks.length} tareas vencidas`}
              description="ReprogramÃ¡ o resolvÃ© estas tareas."
            />
          )}
          {upcomingDues.length > 0 && (
            <AttentionCard
              tone="warning"
              icon={CalendarClock}
              title={`${upcomingDues.length} vencimientos prÃ³ximos`}
              description="RevisÃ¡ costos y renovaciones."
            />
          )}
        </div>
      )}
      <Tabs defaultValue="summary">
        <TabsList className="h-auto flex-wrap justify-start">
          {[
            ["summary", "Resumen"],
            ["tasks", "Tareas"],
            ["assets", "Activos"],
            ["ideas", "Ideas"],
            ["dues", "Vencimientos"],
            ["reviews", "Revisiones"],
            ["kpis", "KPIs"],
            ["notes", "Notas"],
            ["history", "Historial"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="summary">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Datos del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Ãrea", data.areas.find((a) => a.id === p.areaId)?.name],
                  ["Tipo", labels[p.projectType] || p.projectType],
                  ["Madurez", labels[p.maturity]],
                  ["Fecha objetivo", fmt(p.targetDate)],
                  ["Prioridad", labels[p.priority]],
                  ["Ãšltima actualizaciÃ³n", fmt(p.updatedAt)],
                ].map(([a, b]) => (
                  <div key={a}>
                    <p className="text-xs text-slate-400">{a}</p>
                    <p className="mt-1 text-sm font-medium">{b}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pulso</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Metric
                  label="Pendientes"
                  value={tasks.filter((t) => t.status !== "completed").length}
                />
                <Metric
                  label="Vencidas"
                  value={
                    tasks.filter(
                      (t) =>
                        t.dueDate &&
                        days(t.dueDate) < 0 &&
                        t.status !== "completed",
                    ).length
                  }
                  alert
                />
                <Metric label="Activos" value={assets.length} />
                <Metric label="Vencimientos" value={dues.length} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <Card>
            <CardContent className="pt-4">
              {tasks.length ? (
                tasks.map((t) => <TaskLine key={t.id} task={t} />)
              ) : (
                <Empty text="TodavÃ­a no hay tareas asociadas." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assets">
          <SimpleList
            items={assets.map((a) => [
              a.name,
              `${labels[a.type] || a.type} Â· ${a.provider || "Sin proveedor"}`,
            ])}
          />
        </TabsContent>
        <TabsContent value="ideas">
          <SimpleList
            items={ideas.map((i) => [
              i.title,
              i.description || labels[i.status],
            ])}
          />
        </TabsContent>
        <TabsContent value="dues">
          <SimpleList items={dues.map((d) => [d.title, fmt(d.dueDate)])} />
        </TabsContent>
        <TabsContent value="reviews">
          <SimpleList
            items={reviews.map((r) => [r.title, fmt(r.nextReviewDate)])}
          />
        </TabsContent>
        <TabsContent value="kpis">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Tareas totales" value={tasks.length} />
            <MetricCard
              title="Completadas"
              value={tasks.filter((t) => t.status === "completed").length}
            />
            <MetricCard title="Avance" value={`${p.progressPercentage}%`} />
          </div>
        </TabsContent>
        <TabsContent value="notes">
          <SimpleList
            items={[
              [
                "Decisiones y contexto",
                "La ficha estÃ¡ preparada para notas persistentes vÃ­a API REST.",
              ],
            ]}
          />
        </TabsContent>
        <TabsContent value="history">
          <SimpleList
            items={[
              ["Proyecto actualizado", fmt(p.updatedAt)],
              ["PrÃ³xima acciÃ³n definida", p.nextAction || "Pendiente"],
              ["Proyecto creado", "Registro inicial del sistema"],
            ]}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
function SimpleList({ items }: { items: (string | undefined)[][] }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-5">
        {items.length ? (
          items.map((x, i) => (
            <div key={i} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{x[0]}</p>
              <p className="mt-1 text-xs text-slate-500">{x[1]}</p>
            </div>
          ))
        ) : (
          <Empty text="TodavÃ­a no hay elementos asociados." />
        )}
      </CardContent>
    </Card>
  );
}
function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{title}</p>
      </CardContent>
    </Card>
  );
}
function Settings() {
  const { reset } = useData();
  return (
    <>
      <Header
        title="ConfiguraciÃ³n"
        desc="Preferencias de tu centro de control."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Datos de demostraciÃ³n</CardTitle>
          <CardDescription>
            La interfaz persiste tus cambios en este navegador. PostgreSQL queda
            disponible para el entorno completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={reset}>
            Restaurar datos iniciales
          </Button>
        </CardContent>
      </Card>
    </>
  );
}


export function TextWithLinks({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = value.split(urlRegex);
  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}


