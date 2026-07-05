"use client";

import { useEffect, useState, useTransition } from "react";
import { createDueItem, updateDueItem } from "@/actions/dues";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const none = "__none__";

function dateValue(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export function VencimientoFormModal({ open, onOpenChange, item, projects, assets, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; item?: any; projects: any[]; assets: any[]; onSaved?: (item: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(none);
  const [assetId, setAssetId] = useState(none);
  const [type, setType] = useState("subscription");
  const [dueDate, setDueDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [status, setStatus] = useState("pending");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle(item?.title ?? "");
    setDescription(item?.description ?? "");
    setProjectId(item?.projectId ?? none);
    setAssetId(item?.assetId ?? none);
    setType(item?.type ?? "subscription");
    setDueDate(dateValue(item?.dueDate));
    setReminderDate(dateValue(item?.reminderDate));
    setRecurrence(item?.recurrence ?? "none");
    setStatus(item?.status ?? "pending");
    setAmount(item?.amount == null ? "" : String(item.amount));
    setCurrency(item?.currency ?? "ARS");
    setError("");
  }, [item, open]);

  function save() {
    startTransition(async () => {
      setError("");
      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          projectId: projectId === none ? null : projectId,
          assetId: assetId === none ? null : assetId,
          type,
          dueDate,
          reminderDate: reminderDate || null,
          recurrence,
          status,
          amount: amount ? Number(amount) : null,
          currency: currency || null,
        };
        const saved = item ? await updateDueItem(item.id, payload) : await createDueItem(payload);
        onSaved?.(saved);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar el vencimiento.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar vencimiento" : "Nuevo vencimiento"}</DialogTitle>
          <DialogDescription>Registrá renovaciones, controles y fechas operativas importantes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Título"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
          <Field label="Descripción"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto"><Select value={projectId} onValueChange={setProjectId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={none}>General</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Activo"><Select value={assetId} onValueChange={setAssetId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={none}>Sin activo</SelectItem>{assets.map((asset) => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo"><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="domain">Dominio</SelectItem><SelectItem value="hosting">Hosting</SelectItem><SelectItem value="subscription">Suscripción</SelectItem><SelectItem value="license">Licencia</SelectItem><SelectItem value="api">API</SelectItem><SelectItem value="backup">Backup</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent></Select></Field>
            <Field label="Estado"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="done">Realizado</SelectItem><SelectItem value="overdue">Vencido</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select></Field>
            <Field label="Recurrencia"><Select value={recurrence} onValueChange={setRecurrence}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sin recurrencia</SelectItem><SelectItem value="weekly">Semanal</SelectItem><SelectItem value="monthly">Mensual</SelectItem><SelectItem value="quarterly">Trimestral</SelectItem><SelectItem value="yearly">Anual</SelectItem><SelectItem value="custom">Personalizada</SelectItem></SelectContent></Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha de vencimiento"><Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></Field><Field label="Recordatorio"><Input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} /></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Monto"><Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field><Field label="Moneda"><Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} /></Field></div>
          {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
