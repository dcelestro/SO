"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare2, FolderKanban, Lightbulb, ShieldCheck } from "lucide-react";
import { createAsset } from "@/actions/assets";
import { createIdea } from "@/actions/ideas";
import { createProject } from "@/actions/projects";
import { createTask } from "@/actions/tasks";
import { useAppData as useData } from "@/components/use-app-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const none = "__none__";
const kinds = [
  { id: "task", label: "Tarea", Icon: CheckSquare2 },
  { id: "project", label: "Proyecto", Icon: FolderKanban },
  { id: "idea", label: "Idea", Icon: Lightbulb },
  { id: "asset", label: "Activo", Icon: ShieldCheck },
] as const;

export function QuickCreateModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { data } = useData();
  const [kind, setKind] = useState("task");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      setError("");
      const title = String(formData.get("title") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const areaId = String(formData.get("areaId") || "");
      const projectValue = String(formData.get("projectId") || none);
      const projectId = projectValue === none ? null : projectValue;
      const date = String(formData.get("date") || "") || null;
      const priority = String(formData.get("priority") || "medium");

      if (!title) {
        setError("Escribí un título concreto.");
        return;
      }

      try {
        if (kind === "task") {
          await createTask({ title, description: description || null, projectId, status: projectId ? "pending" : "inbox", priority, dueDate: date });
        }

        if (kind === "project") {
          if (!areaId) throw new Error("Seleccioná un área.");
          await createProject({ name: title, description: description || null, areaId, status: "idea", priority, maturity: "idea", projectType: "other" });
        }

        if (kind === "idea") {
          await createIdea({ title, description: description || null, areaId: areaId || null, projectId, potential: priority === "critical" ? "high" : priority, complexity: "medium", origin: "personal", status: "inbox", reviewDate: date });
        }

        if (kind === "asset") {
          await createAsset({ name: title, description: description || null, projectId, areaId: areaId || null, type: String(formData.get("assetType") || "other"), provider: String(formData.get("provider") || "") || null, renewalDate: date, status: "active" });
        }

        router.refresh();
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo crear el registro.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Captura rápida</DialogTitle>
          <DialogDescription>Crear tareas, proyectos, ideas y activos desde un único lugar.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kinds.map(({ id, label, Icon }) => (
            <Button key={id} type="button" variant={kind === id ? "default" : "outline"} className="h-auto flex-col gap-1 py-3 text-xs" onClick={() => { setKind(id); setError(""); }}>
              <Icon className="size-4" />
              {label}
            </Button>
          ))}
        </div>

        <form action={save} className="space-y-4">
          <Field label={kind === "asset" ? "Nombre del activo" : "Título"}>
            <Input name="title" autoFocus />
          </Field>

          {kind !== "task" ? (
            <Field label="Descripción">
              <Textarea name="description" rows={3} />
            </Field>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {kind === "project" || kind === "idea" || kind === "asset" ? (
              <Field label="Área">
                <Select name="areaId" defaultValue={data.areas[0]?.id || ""}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar área" /></SelectTrigger>
                  <SelectContent>{data.areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            ) : null}

            {kind !== "project" ? (
              <Field label="Proyecto">
                <Select name="projectId" defaultValue={none}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={none}>Sin proyecto</SelectItem>
                    {data.projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            {kind !== "asset" ? (
              <Field label={kind === "idea" ? "Potencial" : "Prioridad"}>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            {kind === "asset" ? (
              <>
                <Field label="Tipo"><Input name="assetType" placeholder="domain, hosting, repository..." /></Field>
                <Field label="Proveedor"><Input name="provider" /></Field>
              </>
            ) : null}

            {kind !== "project" ? (
              <Field label={kind === "asset" ? "Renovación" : "Fecha"}><Input name="date" type="date" /></Field>
            ) : null}
          </div>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creando..." : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
