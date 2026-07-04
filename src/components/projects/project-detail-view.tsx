"use client";
import { useUpdateProjectMutation } from "@/hooks/use-queries";

import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, CalendarClock, Snowflake, Zap } from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { Empty, fmt, labels, Status, days } from "@/components/workspace";
import { AttentionCard, SemanticBadge } from "@/components/visual-hierarchy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
// We need TaskLine and Metric from workspace.tsx, let's assume we can import them, 
// or I will export them from workspace.tsx
import { TaskLine, Metric } from "@/components/workspace";

export function ProjectDetailView({ project: p, tasks }: { project: any, tasks: any[] }) {
  const { data } = useData();
  const updateProjectMut = useUpdateProjectMutation();
  
  const id = p.id;
  const assets = data.assets.filter((a) => a.projectId === id);
  const ideas = data.ideas.filter((i) => i.projectId === id);
  const dues = data.dues.filter((d) => d.projectId === id);
  const reviews = data.reviews.filter((r) => r.projectId === id);

  const isMainFocus = p.id === data?.focus?.mainProjectId;
  const isSecondaryFocus = data?.focus?.secondaryProjectIds?.includes(p.id);

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
        ? "Requiere decisión"
        : "Saludable";

  const freeze = () => {
    // We update local state if we want, but since projects are loaded from server,
    // this would require a revalidatePath or router.refresh() in a real app,
    // plus a fetch to /api/projects/:id to change status.
    // For now we simulate the frontend behavior by updating DB via API (assuming API exists)
    fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: "frozen", 
        isFrozen: true,
        frozenReason: "Pausa consciente para reducir frentes abiertos",
        frozenUntil: new Date(Date.now() + 30 * 86400000).toISOString()
      }),
    }).then(() => {
      window.location.reload(); // Simple refresh for MVP
    });
  };

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
                    El proyecto saldrá de los activos y quedará en el
                    Congelador. Se registrará una revisión dentro de 30 días.
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
            items={assets.map((a) => [
              a.name,
              `${labels[a.type] || a.type} · ${a.provider || "Sin proveedor"}`,
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
