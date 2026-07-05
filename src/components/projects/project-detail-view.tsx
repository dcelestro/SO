"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, ArrowRight, CalendarClock, Edit2, Zap } from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { Empty, fmt, labels, Status, days, TaskLine, Metric } from "@/components/workspace";
import { AttentionCard, SemanticBadge } from "@/components/visual-hierarchy";
import { ProjectActionMenu } from "@/components/projects/project-action-menu";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectDetailView({ project, tasks }: { project: any; tasks: any[] }) {
  const router = useRouter();
  const { data } = useData();
  const [p, setProject] = useState(project);
  const [editOpen, setEditOpen] = useState(false);

  const id = p.id;
  const areas = data?.areas?.length ? data.areas : p.area ? [p.area] : [];
  const assets = (data.assets || []).filter((a: any) => a.projectId === id);
  const ideas = (data.ideas || []).filter((i: any) => i.projectId === id);
  const dues = (data.dues || []).filter((d: any) => d.projectId === id);
  const reviews = (data.reviews || []).filter((r: any) => r.projectId === id);

  function mergeProject(updatedProject: any) {
    setProject((current: any) => ({
      ...current,
      ...updatedProject,
      area: updatedProject.area ?? current.area,
      tasks: updatedProject.tasks ?? current.tasks,
    }));
  }

  const isMainFocus = p.id === data?.focus?.mainProjectId;
  const isSecondaryFocus = data?.focus?.secondaryProjectIds?.includes(p.id);

  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && days(t.dueDate) < 0,
  );

  const upcomingDues = dues.filter(
    (d: any) => d.status === "pending" && days(d.dueDate) <= 30,
  );

  const health =
    p.status === "blocked" || overdueTasks.length
      ? "En riesgo"
      : !p.nextAction && p.status === "active"
        ? "Requiere decisión"
        : "Saludable";

  return (
    <>
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-slate-950"
        >
          ← Volver a proyectos
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit2 className="size-4" />
              Editar proyecto
            </Button>
            <ProjectActionMenu
              project={p}
              areas={areas}
              showView={false}
              onUpdated={mergeProject}
              onArchived={() => router.push("/projects")}
              onEditOpenChange={setEditOpen}
            />
          </div>
        </div>
      </div>

      <ProjectFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={p}
        areas={areas}
        onSaved={mergeProject}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <AttentionCard
          tone={!p.nextAction && p.status === "active" ? "warning" : "focus"}
          icon={Zap}
          title="Próxima acción"
          description={
            !p.nextAction && p.status === "active"
              ? "Este proyecto activo necesita dirección."
              : "El siguiente movimiento concreto del proyecto."
          }
          className="md:col-span-2"
        >
          <p
            className={`text-xl font-semibold ${!p.nextAction && p.status === "active" ? "text-orange-800" : "text-blue-950"}`}
          >
            {p.nextAction || "Definir una próxima acción concreta"}
          </p>
          <Button variant="outline" size="sm" className="mt-4 bg-white/70">
            Ver tareas relacionadas <ArrowRight />
          </Button>
        </AttentionCard>
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <b>{p.progressPercentage || 0}%</b>
            </div>
            <Progress className="mt-3" value={p.progressPercentage || 0} />
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
              description="Reprogramá o resolvé estas tareas."
            />
          )}
          {upcomingDues.length > 0 && (
            <AttentionCard
              tone="warning"
              icon={CalendarClock}
              title={`${upcomingDues.length} vencimientos próximos`}
              description="Revisá costos y renovaciones."
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
                  ["Área", p.area?.name || "Sin área"],
                  ["Tipo", labels[p.projectType] || p.projectType],
                  ["Madurez", labels[p.maturity] || p.maturity],
                  ["Fecha objetivo", fmt(p.targetDate)],
                  ["Prioridad", labels[p.priority] || p.priority],
                  ["Última actualización", fmt(p.updatedAt)],
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
                  value={overdueTasks.length}
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
                <Empty text="Todavía no hay tareas asociadas." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assets">
          <SimpleList
            items={assets.map((a: any) => [
              a.name,
              `${labels[a.type] || a.type} · ${a.provider || "Sin proveedor"}`,
            ])}
          />
        </TabsContent>
        <TabsContent value="ideas">
          <SimpleList
            items={ideas.map((i: any) => [
              i.title,
              i.description || labels[i.status],
            ])}
          />
        </TabsContent>
        <TabsContent value="dues">
          <SimpleList items={dues.map((d: any) => [d.title, fmt(d.dueDate)])} />
        </TabsContent>
        <TabsContent value="reviews">
          <SimpleList
            items={reviews.map((r: any) => [r.title, fmt(r.nextReviewDate)])}
          />
        </TabsContent>
        <TabsContent value="kpis">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Tareas totales" value={tasks.length} />
            <MetricCard
              title="Completadas"
              value={tasks.filter((t) => t.status === "completed").length}
            />
            <MetricCard title="Avance" value={`${p.progressPercentage || 0}%`} />
          </div>
        </TabsContent>
        <TabsContent value="notes">
          <SimpleList
            items={[
              [
                "Decisiones y contexto",
                "La ficha está preparada para notas persistentes vía API REST.",
              ],
            ]}
          />
        </TabsContent>
        <TabsContent value="history">
          <SimpleList
            items={[
              ["Proyecto actualizado", fmt(p.updatedAt)],
              ["Próxima acción definida", p.nextAction || "Pendiente"],
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
          <Empty text="Todavía no hay elementos asociados." />
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
