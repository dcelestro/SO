"use client";

import { useState, useTransition } from "react";
import { createAlert } from "@/actions/alerts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const none = "__none__";

export function ManualAlertModal({
  open,
  onOpenChange,
  areas,
  projects,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: any[];
  projects: any[];
  onCreated: (alert: any) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function save(formData: FormData) {
    startTransition(async () => {
      setError("");
      try {
        const projectValue = String(formData.get("projectId") || none);
        const created = await createAlert({
          title: String(formData.get("title") || ""),
          description: String(formData.get("description") || ""),
          areaId: String(formData.get("areaId") || ""),
          projectId: projectValue === none ? null : projectValue,
          severity: String(formData.get("severity") || "medium"),
          type: "manual",
          status: "active",
        });
        onCreated(created);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo crear la alerta.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva alerta manual</DialogTitle>
          <DialogDescription>Para señales que todavía no salen de tareas, proyectos, activos o ideas.</DialogDescription>
        </DialogHeader>
        <form action={save} className="space-y-4">
          <Field label="Título"><Input name="title" autoFocus /></Field>
          <Field label="Descripción"><Textarea name="description" rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Área">
              <Select name="areaId" defaultValue={areas[0]?.id || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar área" /></SelectTrigger>
                <SelectContent>{areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Proyecto">
              <Select name="projectId" defaultValue={none}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Sin proyecto</SelectItem>
                  {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Severidad">
              <Select name="severity" defaultValue="medium">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creando..." : "Crear alerta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
