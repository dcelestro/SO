"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, ExternalLink, Search } from "lucide-react";
import { Header, fmt, Status } from "@/components/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const typeLabels: Record<string, string> = {
  overdue_task: "Tarea vencida",
  missing_next_action: "Sin próxima acción",
  upcoming_date: "Fecha próxima",
  blocked_project: "Proyecto bloqueado",
  inactive_project: "Proyecto inactivo",
  manual: "Manual",
  other: "Otro",
};

type AlertSignal = {
  id: string;
  generated: boolean;
  type: string;
  severity: string;
  title: string;
  description?: string | null;
  context?: string | null;
  date?: string | null;
  href?: string | null;
  status: string;
};

export function AlertsView({ signals, manualAlerts }: { signals: AlertSignal[]; manualAlerts: AlertSignal[]; areas: any[]; projects: any[] }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("open");

  const allRows = useMemo(
    () => [...signals, ...manualAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]),
    [signals, manualAlerts],
  );

  const visibleRows = allRows.filter((item) => {
    const text = [item.title, item.description, item.context, item.type, item.severity].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesView =
      view === "all" ||
      (view === "open" && item.status === "active") ||
      (view === "generated" && item.generated && item.status === "active") ||
      (view === "manual" && !item.generated && item.status === "active") ||
      (view === "closed" && ["resolved", "dismissed"].includes(item.status));
    return matchesSearch && matchesView;
  });

  const openRows = allRows.filter((item) => item.status === "active");

  return (
    <>
      <Header title="Centro de alertas" desc="Señales operativas generadas desde tareas, proyectos, activos e ideas." />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Críticas" value={openRows.filter((item) => item.severity === "critical").length} alert />
        <Metric label="Altas" value={openRows.filter((item) => item.severity === "high").length} alert />
        <Metric label="Abiertas" value={openRows.length} />
        <Metric label="Automáticas" value={signals.length} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Buscar alerta, origen, contexto o severidad..." />
        </div>
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Abiertas</SelectItem>
            <SelectItem value="generated">Automáticas</SelectItem>
            <SelectItem value="manual">Manuales</SelectItem>
            <SelectItem value="closed">Cerradas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {visibleRows.map((item) => <AlertCard key={item.id} item={item} />)}
      </div>

      {!visibleRows.length ? (
        <div className="mt-4 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No hay alertas para este filtro.</div>
      ) : null}
    </>
  );
}

function AlertCard({ item }: { item: AlertSignal }) {
  return (
    <Card className={item.status !== "active" ? "bg-slate-50 opacity-80" : item.severity === "critical" ? "border-red-200 bg-red-50/50" : item.severity === "high" ? "border-orange-200 bg-orange-50/40" : "bg-white"}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
              {item.generated ? <AlertTriangle className="size-4 text-slate-600" /> : <Bell className="size-4 text-slate-600" />}
            </div>
            <div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{typeLabels[item.type] || item.type}</span>
                <span>·</span>
                <span>{item.context || "Sin contexto"}</span>
                {item.date ? <><span>·</span><span>{fmt(item.date)}</span></> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Status value={item.severity} />
            {item.generated ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Automática</span> : <Status value={item.status} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">{item.generated ? "Se resuelve corrigiendo el origen de la señal." : "Alerta manual registrada en el sistema."}</p>
        {item.href ? <Button asChild size="sm" variant="outline"><Link href={item.href}>Abrir origen <ExternalLink className="size-3" /></Link></Button> : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className={`text-2xl font-semibold ${alert && value ? "text-red-600" : "text-slate-900"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
