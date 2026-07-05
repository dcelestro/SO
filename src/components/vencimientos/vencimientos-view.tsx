"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus, Search } from "lucide-react";
import { VencimientoActionMenu } from "@/components/vencimientos/vencimiento-action-menu";
import { VencimientoFormModal } from "@/components/vencimientos/vencimiento-form-modal";
import { Header, fmt, Status, days } from "@/components/workspace";
import { DueDateBadge } from "@/components/visual-hierarchy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function VencimientosView({ items, projects, assets }: { items: any[]; projects: any[]; assets: any[] }) {
  const [rows, setRows] = useState(items);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => setRows(items), [items]);

  function mergeItem(updated: any) {
    setRows((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, project: updated.project ?? item.project, asset: updated.asset ?? item.asset } : item));
  }

  function addItem(item: any) {
    setRows((current) => [item, ...current]);
  }

  function removeItem(id: string) {
    setRows((current) => current.filter((item) => item.id !== id));
  }

  const filtered = rows.filter((item) => {
    const haystack = [item.title, item.description, item.project?.name, item.asset?.name, item.type, item.currency].filter(Boolean).join(" ").toLowerCase();
    const statusOk = status === "all" || (status === "open" ? !["done", "cancelled"].includes(item.status) : item.status === status);
    return haystack.includes(search.toLowerCase()) && statusOk;
  });

  return (
    <>
      <Header
        title="Centro de vencimientos"
        desc="Renovaciones, controles y fechas importantes antes de que se vuelvan urgentes."
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />Nuevo vencimiento</Button>}
      />
      <VencimientoFormModal open={createOpen} onOpenChange={setCreateOpen} projects={projects} assets={assets} onSaved={addItem} />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Buscar vencimiento, proyecto, activo o tipo..." />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Abiertos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="done">Realizados</SelectItem>
            <SelectItem value="overdue">Vencidos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Vencimiento</TableHead><TableHead>Proyecto / activo</TableHead><TableHead>Tipo</TableHead><TableHead>Fecha</TableHead><TableHead>Monto</TableHead><TableHead>Estado</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className={days(item.dueDate) < 0 && item.status === "pending" ? "bg-red-50/60" : days(item.dueDate) <= 7 && item.status === "pending" ? "bg-orange-50/50" : ""}>
                <TableCell><div className="flex items-start gap-3"><CalendarClock className="mt-0.5 size-4 text-slate-400" /><div><p className="font-medium">{item.title}</p>{item.description ? <p className="mt-1 text-xs text-slate-500">{item.description}</p> : null}</div></div></TableCell>
                <TableCell><p className="text-sm">{item.project?.name || "General"}</p><p className="text-xs text-slate-500">{item.asset?.name || "Sin activo"}</p></TableCell>
                <TableCell><Status value={item.type} /></TableCell>
                <TableCell><div className="flex flex-col items-start gap-1"><DueDateBadge days={days(item.dueDate)} done={item.status === "done"} /><span className="text-xs text-slate-500">{fmt(item.dueDate)}</span></div></TableCell>
                <TableCell>{item.amount ? `${item.currency || ""} ${item.amount}` : "-"}</TableCell>
                <TableCell><Status value={item.status} /></TableCell>
                <TableCell><VencimientoActionMenu item={item} projects={projects} assets={assets} onUpdated={mergeItem} onDeleted={removeItem} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length ? <div className="px-4 py-8 text-center text-sm text-slate-400">No hay vencimientos para este filtro.</div> : null}
      </Card>
    </>
  );
}
