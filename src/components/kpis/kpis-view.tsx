"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, Boxes, CheckSquare2, FolderKanban, Lightbulb, ShieldCheck, Siren } from "lucide-react";
import { Header, fmt, Status } from "@/components/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type KpisPayload = {
  tasks: { total: number; open: number; completedLast30: number; overdue: number; dueSoon: number; blocked: number };
  projects: { total: number; active: number; blocked: number; frozen: number; withoutNextAction: number; targetSoon: number; averageProgress: number };
  assets: { total: number; active: number; renewalSoon: number; expired: number };
  ideas: { total: number; inbox: number; promoted: number; reviewSoon: number; conversionRate: number };
  alerts: { active: number; critical: number; high: number };
  knowledge: { documents: number; boards: number };
  riskyProjects: Array<{ id: string; name: string; status: string; priority: string; score: number; overdue: number; blocked: boolean; noNext: boolean; targetDate: string | null }>;
};

export function KpisView({ kpis }: { kpis: KpisPayload }) {
  const healthItems = [
    { label: "Tareas vencidas", value: kpis.tasks.overdue, target: "0", href: "/tasks", bad: kpis.tasks.overdue > 0 },
    { label: "Sin próxima acción", value: kpis.projects.withoutNextAction, target: "0", href: "/projects", bad: kpis.projects.withoutNextAction > 0 },
    { label: "Activos por renovar", value: kpis.assets.renewalSoon, target: "0", href: "/assets", bad: kpis.assets.renewalSoon > 0 },
    { label: "Ideas para revisar", value: kpis.ideas.reviewSoon, target: "0", href: "/ideas", bad: kpis.ideas.reviewSoon > 0 },
  ];

  return (
    <>
      <Header title="KPIs" desc="Indicadores operativos de Nexo: carga, riesgo, avance y señales de atención." />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CheckSquare2} title="Tareas" value={kpis.tasks.open} subtitle={`${kpis.tasks.completedLast30} completadas últimos 30 días`} href="/tasks" />
        <SummaryCard icon={FolderKanban} title="Proyectos activos" value={kpis.projects.active} subtitle={`${kpis.projects.averageProgress}% avance promedio`} href="/projects" />
        <SummaryCard icon={Siren} title="Alertas abiertas" value={kpis.alerts.active} subtitle={`${kpis.alerts.critical} críticas · ${kpis.alerts.high} altas`} href="/alerts" alert={kpis.alerts.critical > 0 || kpis.alerts.high > 0} />
        <SummaryCard icon={Lightbulb} title="Ideas" value={kpis.ideas.inbox} subtitle={`${kpis.ideas.conversionRate}% convertidas a proyecto`} href="/ideas" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Semáforo operativo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {healthItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">Objetivo: {item.target}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-semibold ${item.bad ? "text-red-600" : "text-emerald-700"}`}>{item.value}</p>
                  <Button asChild variant="outline" size="sm"><Link href={item.href}>Ver</Link></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Distribución general</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ProgressLine label="Tareas abiertas" value={kpis.tasks.open} total={Math.max(kpis.tasks.total, 1)} />
            <ProgressLine label="Proyectos activos" value={kpis.projects.active} total={Math.max(kpis.projects.total, 1)} />
            <ProgressLine label="Activos vigentes" value={kpis.assets.active} total={Math.max(kpis.assets.total, 1)} />
            <ProgressLine label="Ideas en inbox" value={kpis.ideas.inbox} total={Math.max(kpis.ideas.total, 1)} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailCard icon={CheckSquare2} title="Carga de tareas" rows={[
          ["Abiertas", kpis.tasks.open],
          ["Vencidas", kpis.tasks.overdue],
          ["Próximos 7 días", kpis.tasks.dueSoon],
          ["Bloqueadas/en espera", kpis.tasks.blocked],
        ]} />
        <DetailCard icon={FolderKanban} title="Estado de proyectos" rows={[
          ["Activos", kpis.projects.active],
          ["Bloqueados", kpis.projects.blocked],
          ["Congelados", kpis.projects.frozen],
          ["Objetivo próximo", kpis.projects.targetSoon],
        ]} />
        <DetailCard icon={ShieldCheck} title="Activos digitales" rows={[
          ["Vigentes", kpis.assets.active],
          ["Renovación próxima", kpis.assets.renewalSoon],
          ["Vencidos", kpis.assets.expired],
          ["Total", kpis.assets.total],
        ]} />
        <DetailCard icon={Lightbulb} title="Ideas" rows={[
          ["Inbox", kpis.ideas.inbox],
          ["Promovidas", kpis.ideas.promoted],
          ["Revisión próxima", kpis.ideas.reviewSoon],
          ["Conversión", `${kpis.ideas.conversionRate}%`],
        ]} />
        <DetailCard icon={Siren} title="Alertas" rows={[
          ["Abiertas", kpis.alerts.active],
          ["Críticas", kpis.alerts.critical],
          ["Altas", kpis.alerts.high],
        ]} />
        <DetailCard icon={Boxes} title="Conocimiento" rows={[
          ["Documentos", kpis.knowledge.documents],
          ["Pizarras", kpis.knowledge.boards],
        ]} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Proyectos con mayor riesgo operativo</CardTitle></CardHeader>
        <CardContent>
          {kpis.riskyProjects.length ? (
            <div className="space-y-3">
              {kpis.riskyProjects.map((project) => (
                <div key={project.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/projects/${project.id}`} className="font-medium text-slate-900 hover:underline">{project.name}</Link>
                      <Status value={project.status} />
                      <Status value={project.priority} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Score {project.score} · {project.overdue} tareas vencidas{project.noNext ? " · sin próxima acción" : ""}{project.blocked ? " · bloqueado" : ""}{project.targetDate ? ` · objetivo ${fmt(project.targetDate)}` : ""}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm"><Link href={`/projects/${project.id}`}>Abrir <ArrowUpRight className="size-3" /></Link></Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No hay proyectos con señales de riesgo.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function SummaryCard({ icon: Icon, title, value, subtitle, href, alert }: { icon: any; title: string; value: number; subtitle: string; href: string; alert?: boolean }) {
  return (
    <Card className={alert ? "border-red-200 bg-red-50/50" : "bg-white"}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <Link href={href} className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="size-5" /></Link>
      </CardContent>
    </Card>
  );
}

function DetailCard({ icon: Icon, title, rows }: { icon: any; title: string; rows: Array<[string, number | string]> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0"><Icon className="size-4" /><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-t pt-2 first:border-0 first:pt-0"><span className="text-sm text-slate-500">{label}</span><span className="font-semibold text-slate-900">{value}</span></div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProgressLine({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = Math.min(100, Math.round((value / total) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-medium">{value}/{total}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}
