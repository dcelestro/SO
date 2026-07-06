"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { updateTask } from "@/actions/tasks";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChartNoAxesGantt,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  Inbox,
  LayoutGrid,
  List,
  Lock,
  PauseCircle,
  Play,
  Search,
  TimerReset,
} from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { Empty, fmt, labels, Status, days, TextWithLinks } from "@/components/workspace";
import { DueDateBadge, SemanticBadge } from "@/components/visual-hierarchy";
import { TaskActionMenu } from "@/components/tasks/task-action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TaskFilter = "today" | "priority" | "overdue" | "blocked" | "waiting" | "inbox" | "no_date" | "all" | "kanban";
type TaskTone = "critical" | "high" | "medium" | "low" | "info";

const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const filterAccent: Record<string, string> = {
  today: "border-l-blue-500",
  priority: "border-l-red-500",
  overdue: "border-l-red-500",
  blocked: "border-l-orange-500",
  waiting: "border-l-amber-500",
  inbox: "border-l-slate-500",
  no_date: "border-l-violet-500",
  all: "border-l-slate-400",
  kanban: "border-l-indigo-500",
};

export function TasksView({
  initialTasks,
  initialTab = "today",
}: {
  initialTasks: any[];
  initialTab?: string;
}) {
  if (initialTab === "gant") {
    return <TasksGant initialTasks={initialTasks} />;
  }

  return <Tasks initialTasks={initialTasks} initialTab={normalizeTab(initialTab)} />;
}

function normalizeTab(value: string): TaskFilter {
  if (["today", "priority", "overdue", "blocked", "waiting", "inbox", "no_date", "all", "kanban"].includes(value)) return value as TaskFilter;
  return "today";
}

function Tasks({ initialTasks, initialTab }: { initialTasks: any[]; initialTab: TaskFilter }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [tab, setTab] = useState<TaskFilter>(initialTab);
  const [search, setSearch] = useState("");
  const { data } = useData();
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState("");
  const dragOverStatusRef = useRef<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedTasks = [...tasks].sort(sortTasks);
  const stats = getTaskStats(tasks);
  const focusTask = sortedTasks.find((task) => isAttentionTask(task)) || sortedTasks[0] || null;
  const visibleTasks = filterTasks(sortedTasks, tab, search);
  const columns = ["pending", "in_progress", "waiting", "blocked", "completed"];

  function mergeTask(updatedTask: any) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === updatedTask.id
          ? {
              ...task,
              ...updatedTask,
              project: updatedTask.project ?? task.project,
            }
          : task,
      ),
    );
  }

  function removeTask(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function patchTask(task: any, payload: Record<string, unknown>, fallbackMessage = "No se pudo guardar la tarea.") {
    setMessage("");
    const previousTasks = tasks;
    mergeTask({ ...task, ...payload });

    startTransition(async () => {
      try {
        const updated = await updateTask(task.id, payload);
        mergeTask(updated);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : fallbackMessage);
        setTasks(previousTasks);
      }
    });
  }

  function updateTaskStatus(task: any, status: string) {
    patchTask(task, {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    }, "No se pudo guardar el estado.");
  }

  function setTaskDueDate(task: any, offset: number) {
    patchTask(task, {
      dueDate: dateInput(offset),
      isToday: offset === 0,
    }, "No se pudo cambiar la fecha.");
  }

  function moveTask(taskId: string, status: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    updateTaskStatus(task, status);
    setDragTaskId(null);
    setDragOverStatus(null);
    dragOverStatusRef.current = null;
    setDragPosition(null);
  }

  function setDropStatus(status: string | null) {
    dragOverStatusRef.current = status;
    setDragOverStatus(status);
  }

  function statusFromPoint(x: number, y: number) {
    const target = document.elementFromPoint(x, y)?.closest("[data-kanban-status]");
    return target?.getAttribute("data-kanban-status") || null;
  }

  function startDrag(taskId: string, status: string, event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("[data-task-actions]")) return;

    event.preventDefault();
    setDragTaskId(taskId);
    setDropStatus(status);
    setDragPosition({ x: event.clientX, y: event.clientY });

    const onMove = (moveEvent: PointerEvent) => {
      setDragPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      const nextStatus = statusFromPoint(moveEvent.clientX, moveEvent.clientY);
      if (nextStatus) setDropStatus(nextStatus);
    };

    const onUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const finalStatus = statusFromPoint(upEvent.clientX, upEvent.clientY) || dragOverStatusRef.current || status;
      moveTask(taskId, finalStatus);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  const draggedTask = dragTaskId ? tasks.find((task) => task.id === dragTaskId) : null;

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#edf1f5]">
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="space-y-5">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tareas</h1>
              <p className="mt-1 text-sm text-slate-500">Centro de ejecución: priorizar, mover, bloquear, posponer o cerrar trabajo.</p>
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarea, proyecto o contexto" className="h-11 rounded-xl bg-white pl-9" />
            </div>
          </section>

          {message ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
            <TaskFocusCard task={focusTask} data={data} onStatusChange={updateTaskStatus} onDueDateChange={setTaskDueDate} onUpdated={mergeTask} onDeleted={removeTask} pending={isPending} />
            <TaskMetricGrid stats={stats} active={tab} onSelect={setTab} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <TaskFilterRail stats={stats} active={tab} onSelect={setTab} />
            {tab === "kanban" ? (
              <KanbanBoard tasks={tasks} columns={columns} dragTaskId={dragTaskId} dragOverStatus={dragOverStatus} onDragStart={startDrag} onDropStatus={setDropStatus} onUpdated={mergeTask} onDeleted={removeTask} />
            ) : (
              <TaskWorkList tasks={visibleTasks} data={data} active={tab} onStatusChange={updateTaskStatus} onDueDateChange={setTaskDueDate} onUpdated={mergeTask} onDeleted={removeTask} />
            )}
          </section>

          {draggedTask && dragPosition ? (
            <div className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-900 bg-white p-3 shadow-2xl" style={{ left: dragPosition.x, top: dragPosition.y }}>
              <p className="text-sm font-semibold">{draggedTask.title}</p>
              <p className="mt-1 text-xs text-slate-500">{labels[draggedTask.status]}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TaskFocusCard({ task, data, onStatusChange, onDueDateChange, onUpdated, onDeleted, pending }: { task: any | null; data: any; onStatusChange: (task: any, status: string) => void; onDueDateChange: (task: any, offset: number) => void; onUpdated: (task: any) => void; onDeleted: (taskId: string) => void; pending: boolean }) {
  if (!task) {
    return (
      <Card className="overflow-hidden border border-emerald-200 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm ring-1 ring-emerald-100/70">
        <CardContent className="flex min-h-[250px] flex-col justify-between p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Sin tareas abiertas
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">No hay trabajo operativo pendiente.</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Las próximas señales aparecerán cuando cargues tareas, fechas, bloqueos o capturas.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const project = task.project || data.projects.find((item: any) => item.id === task.projectId);
  const tone = getTaskTone(task);
  const isRunning = task.status === "in_progress";

  return (
    <Card className={`overflow-hidden border border-slate-200 border-l-4 ${focusBorder(tone)} bg-gradient-to-br from-white via-white to-slate-50 shadow-sm ring-1 ring-slate-200/70`}>
      <CardContent className="relative flex min-h-[250px] flex-col justify-between p-6">
        <div className={`absolute right-6 top-6 grid size-20 place-items-center rounded-full ring-1 ${toneBubble(tone)}`}>
          {tone === "critical" ? <AlertTriangle className="size-9" /> : isRunning ? <Play className="size-9" /> : <CircleDot className="size-9" />}
        </div>
        <div className="pr-24">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950"><TextWithLinks value={task.title} /></h2>
            <Status value={task.priority} />
            {task.status === "blocked" || task.status === "waiting" ? <Status value={task.status} /> : null}
            {isOverdue(task) ? <SemanticBadge value="overdue" label="Vencida" /> : null}
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">{project?.name || "Inbox"} · {taskReason(task, data)}</p>
          {task.description ? <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-slate-600"><TextWithLinks value={task.description} /></p> : null}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3" data-task-actions>
          <Button disabled={pending} onClick={() => onStatusChange(task, isRunning ? "completed" : "in_progress")} className="rounded-xl bg-slate-950 px-5 font-semibold hover:bg-slate-800">
            {isRunning ? <CheckCircle2 className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
            {isRunning ? "Completar" : "Iniciar"}
          </Button>
          <Button disabled={pending} variant="outline" onClick={() => onStatusChange(task, "waiting")} className="rounded-xl">
            <PauseCircle className="mr-2 size-4" />
            En espera
          </Button>
          {!task.dueDate ? (
            <Button disabled={pending} variant="outline" onClick={() => onDueDateChange(task, 0)} className="rounded-xl">
              <CalendarDays className="mr-2 size-4" />
              Hoy
            </Button>
          ) : null}
          <TaskActionMenu task={task as any} onUpdated={onUpdated} onDeleted={onDeleted} />
        </div>
      </CardContent>
    </Card>
  );
}

function TaskMetricGrid({ stats, active, onSelect }: { stats: ReturnType<typeof getTaskStats>; active: TaskFilter; onSelect: (value: TaskFilter) => void }) {
  const metrics = [
    { value: "priority", label: "Críticas / altas", count: stats.priority, detail: "requieren foco", Icon: AlertTriangle, tone: "critical" as TaskTone },
    { value: "today", label: "Hoy", count: stats.today, detail: "con fecha o marcadas", Icon: CalendarDays, tone: "medium" as TaskTone },
    { value: "overdue", label: "Vencidas", count: stats.overdue, detail: "replanificar o cerrar", Icon: TimerReset, tone: "critical" as TaskTone },
    { value: "blocked", label: "Bloqueadas", count: stats.blocked, detail: "detienen avance", Icon: Lock, tone: "high" as TaskTone },
  ];

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="grid h-full p-0 sm:grid-cols-2">
        {metrics.map(({ value, label, count, detail, Icon, tone }) => (
          <button key={value} type="button" onClick={() => onSelect(value as TaskFilter)} className={`group border-t-4 ${topBorder(tone)} p-5 text-left transition hover:bg-slate-50 ${active === value ? "bg-slate-50" : "bg-white"}`}>
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

function TaskFilterRail({ stats, active, onSelect }: { stats: ReturnType<typeof getTaskStats>; active: TaskFilter; onSelect: (value: TaskFilter) => void }) {
  const items: { value: TaskFilter | "gant"; label: string; count?: number; Icon: any }[] = [
    { value: "today", label: "Hoy", count: stats.today, Icon: ClipboardList },
    { value: "priority", label: "Críticas / altas", count: stats.priority, Icon: AlertTriangle },
    { value: "overdue", label: "Vencidas", count: stats.overdue, Icon: TimerReset },
    { value: "blocked", label: "Bloqueadas", count: stats.blocked, Icon: Lock },
    { value: "waiting", label: "En espera", count: stats.waiting, Icon: PauseCircle },
    { value: "inbox", label: "Inbox", count: stats.inbox, Icon: Inbox },
    { value: "no_date", label: "Sin fecha", count: stats.noDate, Icon: Clock3 },
    { value: "all", label: "Todas", count: stats.total, Icon: List },
    { value: "kanban", label: "Kanban", count: stats.total, Icon: LayoutGrid },
    { value: "gant", label: "Gant", Icon: ChartNoAxesGantt },
  ];

  return (
    <Card className="h-fit overflow-hidden border border-slate-200 border-t-4 border-t-slate-400 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <CardTitle className="text-base">Vistas rápidas</CardTitle>
        <CardDescription>Entrá directo al tipo de tarea que necesita acción.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-3">
        {items.map(({ value, label, count, Icon }) =>
          value === "gant" ? (
            <Button key={value} asChild variant="ghost" className="h-auto w-full justify-start rounded-xl border border-transparent px-3 py-2.5 text-left font-medium text-slate-600 hover:bg-slate-50">
              <Link href="/tasks?tab=gant">
                <Icon className="mr-2 size-4" />
                <span className="flex-1">{label}</span>
              </Link>
            </Button>
          ) : (
            <button key={value} type="button" onClick={() => onSelect(value)} className={`flex w-full items-center gap-3 rounded-xl border border-l-4 px-3 py-2.5 text-left transition ${active === value ? "border-slate-300 bg-slate-100 text-slate-950" : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"} ${filterAccent[value]}`}>
              <Icon className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
              {typeof count === "number" ? <Badge variant="outline" className="rounded-full bg-white">{count}</Badge> : null}
            </button>
          ),
        )}
      </CardContent>
    </Card>
  );
}

function TaskWorkList({ tasks, data, active, onStatusChange, onDueDateChange, onUpdated, onDeleted }: { tasks: any[]; data: any; active: TaskFilter; onStatusChange: (task: any, status: string) => void; onDueDateChange: (task: any, offset: number) => void; onUpdated: (task: any) => void; onDeleted: (taskId: string) => void }) {
  return (
    <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-blue-400 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-slate-100 px-4 py-3">
        <div>
          <CardTitle className="text-base">{filterTitle(active)}</CardTitle>
          <CardDescription>{tasks.length} tarea{tasks.length === 1 ? "" : "s"} en esta vista</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {tasks.length ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskListItem key={task.id} task={task} data={data} onStatusChange={onStatusChange} onDueDateChange={onDueDateChange} onUpdated={onUpdated} onDeleted={onDeleted} />
            ))}
          </div>
        ) : (
          <Empty text="No hay tareas en esta vista." />
        )}
      </CardContent>
    </Card>
  );
}

function KanbanBoard({ tasks, columns, dragTaskId, dragOverStatus, onDragStart, onDropStatus, onUpdated, onDeleted }: { tasks: any[]; columns: string[]; dragTaskId: string | null; dragOverStatus: string | null; onDragStart: (taskId: string, status: string, event: React.PointerEvent<HTMLElement>) => void; onDropStatus: (status: string | null) => void; onUpdated: (task: any) => void; onDeleted: (taskId: string) => void }) {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {columns.map((column) => (
        <div key={column} data-kanban-status={column} onPointerEnter={() => dragTaskId && onDropStatus(column)} className={`rounded-2xl border border-slate-200 p-3 shadow-sm ring-1 ring-slate-200/70 transition ${dragOverStatus === column ? "bg-blue-50 ring-2 ring-blue-300" : "bg-white"}`}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">{labels[column]}</p>
            <Badge variant="secondary">{tasks.filter((task) => task.status === column).length}</Badge>
          </div>
          <div className="space-y-2">
            {tasks.filter((task) => task.status === column).map((task) => (
              <Card key={task.id} onPointerDown={(event) => onDragStart(task.id, column, event)} onPointerCancel={() => onDropStatus(null)} className={`cursor-grab touch-none select-none border-l-4 ${taskCardBorder(task)} transition active:cursor-grabbing ${dragTaskId === task.id ? "scale-[0.98] border-slate-300 opacity-45" : ""}`}>
                <CardContent className="group relative p-3">
                  <div data-task-actions onPointerDown={(event) => event.stopPropagation()} className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <TaskActionMenu task={task as any} onUpdated={onUpdated} onDeleted={onDeleted} />
                  </div>
                  <div className="pr-8">
                    <p className="text-sm font-medium"><TextWithLinks value={task.title} /></p>
                    <p className="my-2 text-xs text-slate-500">{task.project?.name || "Inbox"}{task.dueDate ? ` · ${fmt(task.dueDate)}` : ""}</p>
                    <Status value={task.priority} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskListItem({ task, data, onStatusChange, onDueDateChange, onUpdated, onDeleted }: { task: any; data: any; onStatusChange: (task: any, status: string) => void; onDueDateChange: (task: any, offset: number) => void; onUpdated: (task: any) => void; onDeleted: (taskId: string) => void }) {
  const project = task.project || data.projects.find((item: any) => item.id === task.projectId);
  const isMainFocus = task.projectId === data.focus?.mainProjectId;
  const isAvoided = (data.focus?.avoidProjectIds || []).includes(task.projectId || "");
  const overdue = isOverdue(task);
  const running = task.status === "in_progress";

  return (
    <div className={`group flex flex-col gap-3 rounded-xl border border-l-4 border-y-slate-200 border-r-slate-200 px-3 py-3 transition hover:shadow-sm sm:flex-row sm:items-center ${taskToneClass(task, isMainFocus, isAvoided)}`}>
      <button onClick={() => onStatusChange(task, "completed")} className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-slate-300 bg-white text-white hover:border-emerald-500 hover:bg-emerald-500 sm:mt-0" aria-label="Completar tarea">
        <CheckCircle2 className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={task.title} /></p>
          {isMainFocus ? <SemanticBadge value="focus" label="Foco principal" /> : null}
          {isAvoided ? <SemanticBadge value="avoid" label="Fuera de foco" /> : null}
          {overdue ? <SemanticBadge value="overdue" label="Vencida" /> : null}
          {task.status === "blocked" || task.status === "waiting" ? <Status value={task.status} /> : null}
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">{project?.name || "Inbox"} · {taskReason(task, data)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2" data-task-actions>
        <Status value={task.priority} />
        {task.dueDate ? <DueDateBadge days={days(task.dueDate)} done={task.status === "completed"} /> : null}
        <Button size="sm" variant="ghost" onClick={() => onStatusChange(task, running ? "completed" : "in_progress")}>{running ? "Completar" : "Iniciar"}</Button>
        <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => onStatusChange(task, "waiting")}>Espera</Button>
        {!task.dueDate ? <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => onDueDateChange(task, 0)}>Hoy</Button> : null}
        {task.dueDate && days(task.dueDate) < 0 ? <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => onDueDateChange(task, 1)}>Mañana</Button> : null}
        <TaskActionMenu task={task as any} onUpdated={onUpdated} onDeleted={onDeleted} />
      </div>
    </div>
  );
}

function TasksGant({ initialTasks }: { initialTasks: any[] }) {
  const datedTasks = initialTasks.filter((task) => task.dueDate && !["completed", "discarded"].includes(task.status)).sort((a, b) => days(a.dueDate!) - days(b.dueDate!));
  const windowDays = Array.from({ length: 15 }, (_, index) => index - 3);

  return (
    <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen min-h-[calc(100vh-8rem)] bg-[#edf1f5]">
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="space-y-5">
          <section>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tareas</h1>
            <p className="mt-1 text-sm text-slate-500">Línea temporal simple para ubicar vencimientos próximos.</p>
          </section>
          <Card className="overflow-hidden border border-slate-200 border-t-4 border-t-indigo-400 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ChartNoAxesGantt className="size-5 text-slate-500" />
                <CardTitle className="text-base">Próximos 15 días</CardTitle>
              </div>
              <CardDescription>No reemplaza una planificación compleja; sirve para ubicar el trabajo a ojo.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[260px_1fr] border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
                <div className="px-4 py-3">Tarea</div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                  {windowDays.map((offset) => <div key={offset} className="border-l border-slate-200 px-1 py-3 text-center">{offset === 0 ? "Hoy" : offset > 0 ? `+${offset}` : offset}</div>)}
                </div>
              </div>
              {datedTasks.length ? (
                datedTasks.map((task) => {
                  const offset = Math.max(-3, Math.min(11, days(task.dueDate!)));
                  const column = offset + 4;
                  return (
                    <div key={task.id} className="grid grid-cols-[260px_1fr] border-b border-slate-100 last:border-b-0">
                      <div className="min-w-0 px-4 py-3">
                        <p className="truncate text-sm font-semibold"><TextWithLinks value={task.title} /></p>
                        <p className="mt-1 truncate text-xs text-slate-500">{task.project?.name || "Inbox"} · {fmt(task.dueDate)}</p>
                      </div>
                      <div className="relative grid" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                        {windowDays.map((offsetDay) => <div key={offsetDay} className="min-h-16 border-l border-slate-100" />)}
                        <div className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full ${task.status === "blocked" ? "bg-red-500" : task.priority === "critical" ? "bg-amber-500" : task.priority === "high" ? "bg-blue-500" : "bg-slate-400"}`} style={{ left: `calc(${((column - 1) / 15) * 100}% + 6px)`, width: "calc(6.666% - 12px)" }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4"><Empty text="No hay tareas abiertas con fecha para mostrar en Gant." /></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function filterTasks(tasks: any[], tab: TaskFilter, search: string) {
  const q = search.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesSearch = !q || [task.title, task.description, task.project?.name].filter(Boolean).join(" ").toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (tab === "today") return isTodayTask(task) || isOverdue(task) || task.isCritical;
    if (tab === "priority") return task.isCritical || task.priority === "critical" || task.priority === "high";
    if (tab === "overdue") return isOverdue(task);
    if (tab === "blocked") return task.status === "blocked";
    if (tab === "waiting") return task.status === "waiting";
    if (tab === "inbox") return task.status === "inbox";
    if (tab === "no_date") return !task.dueDate;
    return true;
  });
}

function getTaskStats(tasks: any[]) {
  return {
    total: tasks.length,
    priority: tasks.filter((task) => task.isCritical || task.priority === "critical" || task.priority === "high").length,
    today: tasks.filter(isTodayTask).length,
    overdue: tasks.filter(isOverdue).length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    waiting: tasks.filter((task) => task.status === "waiting").length,
    inbox: tasks.filter((task) => task.status === "inbox").length,
    noDate: tasks.filter((task) => !task.dueDate).length,
  };
}

function sortTasks(a: any, b: any) {
  return taskScore(b) - taskScore(a) || taskDay(a) - taskDay(b) || new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
}

function taskScore(task: any) {
  return (task.status === "blocked" ? 80 : 0) + (isOverdue(task) ? 70 : 0) + (task.isCritical ? 55 : 0) + (priorityRank[task.priority] ?? 0) * 12 + (task.status === "waiting" ? 18 : 0) + (isTodayTask(task) ? 16 : 0);
}

function taskDay(task: any) {
  return task.dueDate ? days(task.dueDate) : 999;
}

function isTodayTask(task: any) {
  return Boolean(task.isToday || (task.dueDate && days(task.dueDate) === 0));
}

function isOverdue(task: any) {
  return Boolean(task.dueDate && days(task.dueDate) < 0 && task.status !== "completed");
}

function isAttentionTask(task: any) {
  return isOverdue(task) || task.status === "blocked" || task.isCritical || task.priority === "critical" || task.priority === "high" || task.status === "waiting";
}

function taskReason(task: any, data: any) {
  const isMainFocus = task.projectId === data.focus?.mainProjectId;
  const isAvoided = (data.focus?.avoidProjectIds || []).includes(task.projectId || "");
  if (isOverdue(task)) return "Vencida: necesita resolución o una nueva fecha";
  if (task.status === "blocked") return "Está bloqueando el avance";
  if (task.status === "waiting") return "Está esperando algo externo";
  if (isMainFocus) return "Pertenece al foco principal";
  if (isAvoided) return "Proyecto marcado como no tocar";
  if (task.isCritical || task.priority === "critical") return "Prioridad crítica";
  if (task.status === "inbox") return "Captura pendiente de procesar";
  if (!task.dueDate) return "Sin fecha definida";
  return `Fecha: ${fmt(task.dueDate)}`;
}

function taskToneClass(task: any, isMainFocus: boolean, isAvoided: boolean) {
  if (task.status === "completed") return "border-l-emerald-500 bg-emerald-50/60";
  if (isOverdue(task) || task.status === "blocked") return "border-l-red-500 bg-red-50/70";
  if (isMainFocus) return "border-l-blue-600 bg-blue-50/70";
  if (task.priority === "critical" || task.priority === "high") return "border-l-orange-500 bg-orange-50/60";
  if (isAvoided) return "border-l-amber-400 bg-amber-50/50";
  return "border-l-slate-200 bg-white";
}

function getTaskTone(task: any): TaskTone {
  if (isOverdue(task) || task.status === "blocked") return "critical";
  if (task.priority === "critical" || task.priority === "high" || task.status === "waiting") return "high";
  if (isTodayTask(task) || task.status === "in_progress") return "medium";
  if (task.status === "completed") return "low";
  return "info";
}

function topBorder(tone: TaskTone) {
  if (tone === "critical") return "border-t-red-400";
  if (tone === "high") return "border-t-orange-400";
  if (tone === "medium") return "border-t-blue-400";
  if (tone === "low") return "border-t-emerald-400";
  return "border-t-slate-300";
}

function focusBorder(tone: TaskTone) {
  if (tone === "critical") return "border-l-red-500";
  if (tone === "high") return "border-l-orange-500";
  if (tone === "medium") return "border-l-blue-500";
  if (tone === "low") return "border-l-emerald-500";
  return "border-l-slate-400";
}

function toneBubble(tone: TaskTone) {
  if (tone === "critical") return "bg-red-50 text-red-700 ring-red-100";
  if (tone === "high") return "bg-orange-50 text-orange-700 ring-orange-100";
  if (tone === "medium") return "bg-blue-50 text-blue-700 ring-blue-100";
  if (tone === "low") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-slate-50 text-slate-600 ring-slate-100";
}

function toneText(tone: TaskTone) {
  if (tone === "critical") return "text-red-700";
  if (tone === "high") return "text-orange-700";
  if (tone === "medium") return "text-blue-700";
  if (tone === "low") return "text-emerald-700";
  return "text-slate-700";
}

function taskCardBorder(task: any) {
  if (isOverdue(task) || task.status === "blocked") return "border-l-red-500";
  if (task.status === "waiting") return "border-l-orange-500";
  if (task.priority === "critical" || task.priority === "high") return "border-l-amber-500";
  if (task.status === "in_progress") return "border-l-blue-500";
  if (task.status === "completed") return "border-l-emerald-500";
  return "border-l-slate-300";
}

function filterTitle(active: TaskFilter) {
  const titles: Record<TaskFilter, string> = {
    today: "Hoy",
    priority: "Críticas / altas",
    overdue: "Vencidas",
    blocked: "Bloqueadas",
    waiting: "En espera",
    inbox: "Inbox",
    no_date: "Sin fecha",
    all: "Todas",
    kanban: "Kanban",
  };
  return titles[active];
}

function dateInput(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
