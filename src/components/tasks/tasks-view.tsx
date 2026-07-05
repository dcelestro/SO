"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { updateTask } from "@/actions/tasks";
import {
  ChartNoAxesGantt,
  ClipboardList,
  Inbox,
  LayoutGrid,
  List,
} from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import {
  Empty,
  fmt,
  Header,
  labels,
  Status,
  days,
  TextWithLinks,
} from "@/components/workspace";
import { DueDateBadge, SemanticBadge } from "@/components/visual-hierarchy";
import { TaskActionMenu } from "@/components/tasks/task-action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

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

  return <Tasks initialTasks={initialTasks} initialTab={initialTab} />;
}

function Tasks({ initialTasks, initialTab }: { initialTasks: any[]; initialTab: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const { data } = useData();
  const [tab, setTab] = useState(initialTab);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [kanbanMessage, setKanbanMessage] = useState("");
  const dragOverStatusRef = useRef<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered =
    tab === "today"
      ? tasks.filter(
          (task) =>
            task.isToday ||
            task.isCritical ||
            (task.dueDate && days(task.dueDate) <= 0),
        )
      : tab === "inbox"
        ? tasks.filter((task) => task.status === "inbox")
        : tasks;

  const columns = ["pending", "in_progress", "blocked", "completed"];

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

  function updateTaskStatus(task: any, status: string) {
    setKanbanMessage("");
    const previousTasks = tasks;
    const optimisticTask = { ...task, status };

    mergeTask(optimisticTask);

    startTransition(async () => {
      try {
        const updated = await updateTask(task.id, { status });
        mergeTask(updated);
      } catch (error) {
        setKanbanMessage(
          error instanceof Error ? error.message : "No se pudo guardar el estado.",
        );
        setTasks(previousTasks);
      }
    });
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
    const target = document
      .elementFromPoint(x, y)
      ?.closest("[data-kanban-status]");
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
      const finalStatus =
        statusFromPoint(upEvent.clientX, upEvent.clientY) ||
        dragOverStatusRef.current ||
        status;
      moveTask(taskId, finalStatus);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  const draggedTask = dragTaskId
    ? tasks.find((task) => task.id === dragTaskId)
    : null;

  return (
    <>
      <Header title="Tareas" desc="" />
      <Tabs value={tab} onValueChange={setTab}>
        <TaskSubmenu active={tab} onSelect={setTab} />
        {tab !== "kanban" ? (
          <Card className="mt-4">
            <CardContent className="pt-4">
              {kanbanMessage ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {kanbanMessage}
                </div>
              ) : null}
              {filtered.length ? (
                <div className="space-y-2">
                  {filtered.map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      data={data}
                      onStatusChange={updateTaskStatus}
                      onUpdated={mergeTask}
                      onDeleted={removeTask}
                    />
                  ))}
                </div>
              ) : (
                <Empty text="No hay tareas en esta vista." />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {kanbanMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 lg:col-span-4">
                {kanbanMessage}
              </div>
            ) : null}
            {columns.map((column) => (
              <div
                key={column}
                data-kanban-status={column}
                onPointerEnter={() => dragTaskId && setDropStatus(column)}
                className={`rounded-xl p-3 transition ${
                  dragOverStatus === column
                    ? "bg-blue-50 ring-2 ring-blue-300"
                    : "bg-slate-100"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">{labels[column]}</p>
                  <Badge variant="secondary">
                    {tasks.filter((task) => task.status === column).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {tasks
                    .filter((task) => task.status === column)
                    .map((task) => (
                      <Card
                        key={task.id}
                        onPointerDown={(event) => startDrag(task.id, column, event)}
                        onPointerCancel={() => {
                          setDragTaskId(null);
                          setDropStatus(null);
                          setDragPosition(null);
                        }}
                        className={`cursor-grab touch-none select-none transition active:cursor-grabbing ${
                          dragTaskId === task.id
                            ? "scale-[0.98] border-slate-300 opacity-45"
                            : ""
                        }`}
                      >
                        <CardContent className="relative p-3 group">
                          <div
                            data-task-actions
                            onPointerDown={(event) => event.stopPropagation()}
                            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <TaskActionMenu
                              task={task as any}
                              onUpdated={mergeTask}
                              onDeleted={removeTask}
                            />
                          </div>
                          <div className="pr-8">
                            <p className="text-sm font-medium">
                              <TextWithLinks value={task.title} />
                            </p>
                            <p className="my-2 text-xs text-slate-500">
                              {task.project?.name || "Inbox"}
                            </p>
                            <Status value={task.priority} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
            {draggedTask && dragPosition ? (
              <div
                className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-900 bg-white p-3 shadow-2xl"
                style={{ left: dragPosition.x, top: dragPosition.y }}
              >
                <p className="text-sm font-semibold">{draggedTask.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {labels[draggedTask.status]}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Tabs>
    </>
  );
}

function TaskListItem({
  task,
  data,
  onStatusChange,
  onUpdated,
  onDeleted,
}: {
  task: any;
  data: any;
  onStatusChange: (task: any, status: string) => void;
  onUpdated: (task: any) => void;
  onDeleted: (taskId: string) => void;
}) {
  const project = task.project || data.projects.find((item: any) => item.id === task.projectId);
  const isMainFocus = task.projectId === data.focus?.mainProjectId;
  const isAvoided = (data.focus?.avoidProjectIds || []).includes(task.projectId || "");
  const isOverdue = Boolean(
    task.dueDate && days(task.dueDate) < 0 && task.status !== "completed",
  );

  const reason = isOverdue
    ? "Vencida: necesita resolución o una nueva fecha"
    : isMainFocus
      ? "Pertenece al foco principal de esta semana"
      : task.status === "blocked"
        ? "Está bloqueando el avance del proyecto"
        : isAvoided
          ? "Advertencia: este proyecto está marcado como no tocar"
          : task.priority === "critical"
            ? "Prioridad crítica"
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

  return (
    <div
      className={`group flex flex-col gap-3 rounded-lg border border-l-4 border-y-slate-200 border-r-slate-200 px-3 py-3 transition hover:shadow-sm sm:flex-row sm:items-center ${toneClass}`}
    >
      <button
        onClick={() => onStatusChange(task, "completed")}
        className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-slate-300 bg-white hover:border-emerald-500 sm:mt-0"
        aria-label="Completar tarea"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            <TextWithLinks value={task.title} />
          </p>
          {isMainFocus ? <SemanticBadge value="focus" label="Foco principal" /> : null}
          {isAvoided ? <SemanticBadge value="avoid" label="Fuera de foco" /> : null}
          {isOverdue ? <SemanticBadge value="overdue" label="Vencida" /> : null}
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">
          {project?.name || "Inbox"} · {reason}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Status value={task.priority} />
        {task.dueDate ? (
          <DueDateBadge
            days={days(task.dueDate)}
            done={task.status === "completed"}
          />
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            onStatusChange(
              task,
              task.status === "in_progress" ? "completed" : "in_progress",
            )
          }
        >
          {task.status === "in_progress" ? "Completar" : "Iniciar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-500"
          onClick={() => onStatusChange(task, "waiting")}
        >
          Posponer
        </Button>
        <TaskActionMenu
          task={task as any}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}

function TaskSubmenu({
  active,
  onSelect,
}: {
  active: string;
  onSelect?: (value: string) => void;
}) {
  const items = [
    { value: "today", href: "/tasks", label: "Hoy", Icon: ClipboardList },
    { value: "all", href: "/tasks?tab=all", label: "Todas", Icon: List },
    { value: "inbox", href: "/tasks?tab=inbox", label: "Inbox", Icon: Inbox },
    { value: "kanban", href: "/tasks?tab=kanban", label: "Kanban", Icon: LayoutGrid },
    { value: "gant", href: "/tasks?tab=gant", label: "Gant", Icon: ChartNoAxesGantt },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map(({ href, label, Icon, value }) => (
        value === "gant" || !onSelect ? (
          <Button key={value} asChild variant={active === value ? "default" : "outline"} size="sm">
            <Link href={href}>
              <Icon className="size-4" />
              {label}
            </Link>
          </Button>
        ) : (
          <Button
            key={value}
            type="button"
            variant={active === value ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect?.(value)}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        )
      ))}
    </div>
  );
}

function TasksGant({ initialTasks }: { initialTasks: any[] }) {
  const datedTasks = initialTasks
    .filter((task) => task.dueDate && !["completed", "discarded"].includes(task.status))
    .sort((a, b) => days(a.dueDate!) - days(b.dueDate!));

  const windowDays = Array.from({ length: 15 }, (_, index) => index - 3);
  return (
    <>
      <Header
        title="Tareas"
        desc=""
      />
      <TaskSubmenu active="gant" />
      <Card className="overflow-hidden border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ChartNoAxesGantt className="size-5 text-slate-500" />
            <CardTitle className="text-base">Próximos 15 días</CardTitle>
          </div>
          <CardDescription>
            No reemplaza una planificación compleja; sirve para ubicar el trabajo a ojo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[260px_1fr] border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            <div className="px-4 py-3">Tarea</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
              {windowDays.map((offset) => (
                <div key={offset} className="border-l border-slate-200 px-1 py-3 text-center">
                  {offset === 0 ? "Hoy" : offset > 0 ? `+${offset}` : offset}
                </div>
              ))}
            </div>
          </div>
          {datedTasks.length ? (
            datedTasks.map((task) => {
              const offset = Math.max(-3, Math.min(11, days(task.dueDate!)));
              const column = offset + 4;
              return (
                <div key={task.id} className="grid grid-cols-[260px_1fr] border-b border-slate-100 last:border-b-0">
                  <div className="min-w-0 px-4 py-3">
                    <p className="truncate text-sm font-semibold">
                      <TextWithLinks value={task.title} />
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {task.project?.name || "Inbox"} · {fmt(task.dueDate)}
                    </p>
                  </div>
                  <div className="relative grid" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                    {windowDays.map((offsetDay) => (
                      <div key={offsetDay} className="min-h-16 border-l border-slate-100" />
                    ))}
                    <div
                      className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full ${
                        task.status === "blocked"
                          ? "bg-red-500"
                          : task.priority === "critical"
                            ? "bg-amber-500"
                            : task.priority === "high"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                      }`}
                      style={{
                        left: `calc(${((column - 1) / 15) * 100}% + 6px)`,
                        width: "calc(6.666% - 12px)",
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4">
              <Empty text="No hay tareas abiertas con fecha para mostrar en Gant." />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
