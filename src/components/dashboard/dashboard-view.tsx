"use client";

import Link from "next/link";
import { useState } from "react";
import { Header, Empty, Status, fmt, days, TextWithLinks } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardView({ data }: { data: { tasks: any[]; projects: any[]; assets: any[]; ideas: any[] } }) {
  const openTasks = data.tasks;
  const projectById = new Map(data.projects.map((project) => [project.id, project]));
  const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const taskScore = (task: any) =>
    (priorityRank[task.priority] ?? 0) * 20 +
    (task.dueDate && days(task.dueDate) < 0 ? 30 : 0) +
    (task.dueDate && days(task.dueDate) === 0 ? 22 : 0) +
    (task.isCritical ? 18 : 0) +
    (task.status === "blocked" ? 16 : 0) +
    (task.status === "waiting" ? 10 : 0);

  const priorityTasks = [...openTasks]
    .filter((task) => ["critical", "high"].includes(task.priority) || task.isCritical || task.status === "blocked" || Boolean(task.dueDate && days(task.dueDate) <= 0))
    .sort((a, b) => taskScore(b) - taskScore(a) || (a.dueDate ? days(a.dueDate) : 999) - (b.dueDate ? days(b.dueDate) : 999));

  const todayTasks = openTasks
    .filter((task) => task.isToday || Boolean(task.dueDate && days(task.dueDate) === 0))
    .sort((a, b) => taskScore(b) - taskScore(a));

  const weekTasks = openTasks
    .filter((task) => task.dueDate && days(task.dueDate) >= 0 && days(task.dueDate) <= 7)
    .sort((a, b) => days(a.dueDate!) - days(b.dueDate!));

  const activeProjects = data.projects.filter((project) => project.status === "active");
  const blockedTasks = openTasks.filter((task) => ["blocked", "waiting"].includes(task.status));
  const blockedProjects = data.projects.filter((project) => project.status === "blocked");

  const waitingItems = [
    ...blockedTasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: task.project?.name || projectById.get(task.projectId || "")?.name || "Inbox",
      status: task.status,
      priority: task.priority,
      href: "/tasks",
    })),
    ...blockedProjects.map((project) => ({
      id: `project-${project.id}`,
      title: project.name,
      subtitle: project.nextAction || project.description || "Proyecto detenido",
      status: project.status,
      priority: project.priority,
      href: `/projects/${project.id}`,
    })),
  ].sort((a, b) => Number(b.status === "blocked") - Number(a.status === "blocked") || (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0));

  const signalItems = [
    ...openTasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: task.project?.name || projectById.get(task.projectId || "")?.name || "Inbox",
        date: task.dueDate!,
        kind: "Tarea",
        tone: task.status === "blocked" || days(task.dueDate!) < 0 ? "critical" : task.priority,
        href: "/tasks",
      })),
    ...data.assets
      .filter((asset) => asset.renewalDate)
      .map((asset) => ({
        id: `asset-${asset.id}`,
        title: asset.name,
        subtitle: asset.provider || asset.project?.name || "Activo digital",
        date: asset.renewalDate!,
        kind: "Renovación",
        tone: days(asset.renewalDate!) < 0 ? "critical" : "high",
        href: "/assets",
      })),
    ...data.ideas
      .filter((idea) => idea.reviewDate)
      .map((idea) => ({
        id: `idea-${idea.id}`,
        title: idea.title,
        subtitle: idea.project?.name || "Idea en incubadora",
        date: idea.reviewDate!,
        kind: "Revisión de idea",
        tone: days(idea.reviewDate!) < 0 ? "medium" : "low",
        href: "/ideas",
      })),
    ...data.projects
      .filter((project) => project.targetDate)
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: project.nextAction || "Fecha objetivo",
        date: project.targetDate!,
        kind: "Proyecto",
        tone: days(project.targetDate!) < 0 ? "critical" : project.priority,
        href: `/projects/${project.id}`,
      })),
  ].sort((a, b) => days(a.date) - days(b.date));

  return (
    <>
      <Header title="Dashboard" desc="" />
      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <DashboardPanel title="Prioritario" count={priorityTasks.length}>
          <DashboardTaskList tasks={priorityTasks.slice(0, 8)} projectById={projectById} empty="No hay prioridades abiertas." />
        </DashboardPanel>
        <div className="space-y-4">
          <DashboardPanel title="Proyectos activos">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold tracking-tight text-slate-950">{activeProjects.length}</p>
                <p className="mt-1 text-sm text-slate-500">frentes en movimiento</p>
              </div>
              <Button asChild variant="outline" size="sm"><Link href="/projects">Ver proyectos</Link></Button>
            </div>
            <div className="mt-4 space-y-2">
              {activeProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="truncate text-sm font-medium">{project.name}</span>
                  <Status value={project.priority} />
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Próximas señales" count={signalItems.length}>
            <DashboardSignalList items={signalItems.slice(0, 5)} empty="No hay señales próximas." />
          </DashboardPanel>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardPanel title="Trabado / esperando" count={waitingItems.length}>
          <div className="space-y-2">
            {waitingItems.length ? waitingItems.slice(0, 8).map((item) => (
              <Link key={item.id} href={item.href} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                </div>
                <Status value={item.status} />
              </Link>
            )) : <Empty text="No hay bloqueos ni esperas externas." />}
          </div>
        </DashboardPanel>
        <DashboardPanel title="Hoy" count={todayTasks.length}>
          <DashboardTaskList tasks={todayTasks.slice(0, 6)} projectById={projectById} empty="Nada marcado para hoy." />
        </DashboardPanel>
        <DashboardPanel title="Esta semana" count={weekTasks.length}>
          <DashboardTaskList tasks={weekTasks.slice(0, 7)} projectById={projectById} empty="No hay tareas con fecha esta semana." />
        </DashboardPanel>
        <DashboardCalendar items={signalItems} />
      </div>
    </>
  );
}

type DashboardCalendarItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  kind: string;
  tone: string;
  href: string;
};

function DashboardPanel({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {typeof count === "number" ? <Badge variant="outline" className="rounded-full">{count}</Badge> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DashboardTaskList({ tasks, projectById, empty }: { tasks: any[]; projectById: Map<string, any>; empty: string }) {
  return (
    <div className="space-y-2">
      {tasks.length ? tasks.map((task) => <DashboardTaskRow key={task.id} task={task} project={task.project || projectById.get(task.projectId || "")} />) : <Empty text={empty} />}
    </div>
  );
}

function DashboardTaskRow({ task, project }: { task: any; project?: any }) {
  const overdue = Boolean(task.dueDate && days(task.dueDate) < 0);
  const today = Boolean(task.dueDate && days(task.dueDate) === 0);
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${overdue || task.status === "blocked" ? "border-red-200 bg-red-50/70" : today || task.priority === "critical" ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white"}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={task.title} /></p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{project?.name || "Inbox"}{task.dueDate ? ` · ${overdue ? "Vencida" : fmt(task.dueDate)}` : ""}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Status value={task.priority} />
        {task.status === "blocked" || task.status === "waiting" ? <Status value={task.status} /> : null}
      </div>
    </div>
  );
}

function DashboardSignalList({ items, empty }: { items: DashboardCalendarItem[]; empty: string }) {
  return (
    <div className="space-y-2">
      {items.length ? items.map((item) => <DashboardSignalRow key={item.id} item={item} />) : <Empty text={empty} />}
    </div>
  );
}

function DashboardSignalRow({ item }: { item: DashboardCalendarItem }) {
  const d = days(item.date);
  const overdue = d < 0;
  const today = d === 0;
  return (
    <Link href={item.href} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${overdue ? "border-red-200 bg-red-50/70" : today ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950"><TextWithLinks value={item.title} /></p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{item.kind} · {item.subtitle} · {fmt(item.date)}</p>
      </div>
      <Badge variant={overdue ? "destructive" : "secondary"} className={overdue ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50" : today ? "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}>{overdue ? "Vencida" : today ? "Hoy" : `En ${d} días`}</Badge>
    </Link>
  );
}

const TODAY = Date.now();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DashboardCalendar({ items }: { items: DashboardCalendarItem[] }) {
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date(TODAY)));
  const monthDate = new Date(TODAY);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [...Array.from({ length: startOffset }, () => null), ...Array.from({ length: last.getDate() }, (_, index) => new Date(year, month, index + 1))];
  while (cells.length % 7 !== 0) cells.push(null);
  const itemsByDate = new Map<string, DashboardCalendarItem[]>();
  for (const item of items) {
    const key = dateKey(new Date(item.date));
    itemsByDate.set(key, [...(itemsByDate.get(key) || []), item]);
  }
  const selectedItems = itemsByDate.get(selectedDate) || [];
  return (
    <DashboardPanel title="Calendario mensual">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold capitalize text-slate-900">{new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(monthDate)}</p>
        <Badge variant="secondary">{items.length} señales</Badge>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <div key={`${day}-${index}`} className="py-1">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const key = cell ? dateKey(cell) : `empty-${index}`;
          const dayItems = cell ? itemsByDate.get(dateKey(cell)) || [] : [];
          const isToday = cell && dateKey(cell) === dateKey(new Date(TODAY));
          const selected = cell && dateKey(cell) === selectedDate;
          return (
            <button key={key} type="button" disabled={!cell} onClick={() => cell && setSelectedDate(dateKey(cell))} className={`relative h-11 rounded-md border text-xs transition ${!cell ? "border-transparent bg-transparent" : selected ? "border-slate-950 bg-slate-950 text-white" : isToday ? "border-amber-300 bg-amber-50 text-slate-950" : "border-slate-100 bg-white hover:border-slate-300"}`}>
              {cell ? cell.getDate() : ""}
              {dayItems.length ? (
                <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {dayItems.slice(0, 3).map((item) => <span key={item.id} className={`size-1.5 rounded-full ${item.tone === "critical" ? "bg-red-500" : item.tone === "high" ? "bg-orange-500" : item.tone === "medium" ? "bg-blue-500" : "bg-slate-400"}`} />)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2">
        {selectedItems.length ? selectedItems.map((item) => (
          <Link key={item.id} href={item.href} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.kind}</p>
            </div>
            <Badge variant="outline">{fmt(item.date)}</Badge>
          </Link>
        )) : <p className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-500">Sin elementos para ese día.</p>}
      </div>
    </DashboardPanel>
  );
}
