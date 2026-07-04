"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { updateTask } from "@/actions/tasks";
import { ClipboardList, Inbox, LayoutGrid, List, ChartNoAxesGantt } from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { Empty, fmt, Header, labels, Status, days, TextWithLinks, TaskLine } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

export function TasksView({ initialTasks, initialTab = "today" }: { initialTasks: any[], initialTab?: string }) {
  if (initialTab === "gant") {
    return <TasksGant initialTasks={initialTasks} />;
  }

  return <Tasks initialTasks={initialTasks} initialTab={initialTab} />;
}

function Tasks({ initialTasks, initialTab }: { initialTasks: any[], initialTab: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const { data } = useData(); // Needed for focus, etc, though maybe not directly here but inside TaskLine
  const [tab, setTab] = useState(initialTab);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [kanbanMessage, setKanbanMessage] = useState("");
  const dragOverStatusRef = useRef<string | null>(null);

  const filtered =
    tab === "today"
      ? tasks.filter(
          (t) =>
            t.isToday || t.isCritical || (t.dueDate && days(t.dueDate) <= 0),
        )
      : tab === "inbox"
        ? tasks.filter((t) => t.status === "inbox")
        : tasks;
  
  const columns = ["pending", "in_progress", "blocked", "completed"];

  const [isPending, startTransition] = useTransition();

  function moveTask(taskId: string, status: string) {
    setKanbanMessage("");
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
    startTransition(async () => {
      try {
        const updated = await updateTask(taskId, { status });
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task))
        );
      } catch (error) {
        setKanbanMessage(error instanceof Error ? error.message : "No se pudo guardar el estado.");
        setTasks(prevTasks); // revertir optimista
      }
    });
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
              {filtered.length ? (
                filtered.map((t) => <TaskLine key={t.id} task={t} />)
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
            {columns.map((c) => (
              <div
                key={c}
                data-kanban-status={c}
                onPointerEnter={() => dragTaskId && setDropStatus(c)}
                className={`rounded-xl p-3 transition ${
                  dragOverStatus === c
                    ? "bg-blue-50 ring-2 ring-blue-300"
                    : "bg-slate-100"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">{labels[c]}</p>
                  <Badge variant="secondary">
                    {tasks.filter((t) => t.status === c).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === c)
                    .map((t) => (
                      <Card
                        key={t.id}
                        onPointerDown={(event) => startDrag(t.id, c, event)}
                        onPointerCancel={() => {
                          setDragTaskId(null);
                          setDropStatus(null);
                          setDragPosition(null);
                        }}
                        className={`cursor-grab touch-none select-none transition active:cursor-grabbing ${
                          dragTaskId === t.id
                            ? "scale-[0.98] border-slate-300 opacity-45"
                            : ""
                        }`}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">
                            <TextWithLinks value={t.title} />
                          </p>
                          <p className="my-2 text-xs text-slate-500">
                            {t.project?.name || "Inbox"}
                          </p>
                          <Status value={t.priority} />
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
