"use client";

import { useCreateTaskMutation, useCreateProjectMutation, useCreateAssetMutation, useCreateIdeaMutation, useCreateDueItemMutation, useCreateReviewMutation } from "@/hooks/use-queries";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData as useData } from "@/components/use-app-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarClock,
  CheckSquare2,
  FolderKanban,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const kinds = [
  { id: "task", label: "Tarea", icon: CheckSquare2 },
  { id: "project", label: "Proyecto", icon: FolderKanban },
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "asset", label: "Activo", icon: ShieldCheck },
  { id: "due", label: "Vencimiento", icon: CalendarClock },
  { id: "review", label: "Revisión", icon: RefreshCw },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo crear el registro.";
}

export function QuickCreate({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { data } = useData();
  const [kind, setKind] = useState("task");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const createProjectMut = useCreateProjectMutation();
  const createTaskMut = useCreateTaskMutation();
  const createAssetMut = useCreateAssetMutation();
  const createIdeaMut = useCreateIdeaMutation();
  const createDueItemMut = useCreateDueItemMutation();
  const createReviewMut = useCreateReviewMutation();

  async function save(fd: FormData) {
    const title = String(fd.get("title") || "").trim();
    const rawProject = String(fd.get("projectId") || "");
    const projectId = rawProject === "none" ? undefined : rawProject || undefined;
    const areaId =
      String(fd.get("areaId") || "") ||
      data.projects.find((p) => p.id === projectId)?.areaId;

    if (!title) {
      setError("Escribí un título concreto.");
      return;
    }

    const date = String(fd.get("date") || "") || undefined;
    const priority = String(fd.get("priority") || "medium");
    const description = String(fd.get("description") || "");

    setIsSaving(true);
    setError("");

    try {
      if (kind === "project") {
        const status = String(fd.get("status") || "idea");
        const nextAction = String(fd.get("nextAction") || "").trim();

        if (!areaId) {
          setError("Seleccioná un área.");
          return;
        }
        if (status === "active" && !nextAction) {
          setError("Todo proyecto activo debe tener una próxima acción concreta.");
          return;
        }

        await createProjectMut.mutateAsync({
          name: title,
          description,
          areaId,
          status,
          priority,
          maturity: "idea",
          projectType: "other",
          nextAction: nextAction || undefined,
        });
      } else if (kind === "task") {
        await createTaskMut.mutateAsync({
          title,
          projectId,
          status: projectId ? "pending" : "inbox",
          priority,
          dueDate: date,
        });
      } else if (kind === "idea") {
        await createIdeaMut.mutateAsync({
          title,
          description,
          areaId,
          origin: "personal",
          status: "inbox",
          reviewDate: date,
        });
      } else if (kind === "asset") {
        await createAssetMut.mutateAsync({
          name: title,
          projectId,
          type: String(fd.get("type") || "other"),
          provider: String(fd.get("provider") || ""),
          renewalDate: date,
          status: "active",
        });
      } else if (kind === "due") {
        await createDueItemMut.mutateAsync({
          title,
          projectId,
          type: String(fd.get("type") || "other"),
          dueDate: date || new Date().toISOString(),
          status: "pending",
        });
      } else {
        await createReviewMut.mutateAsync({
          title,
          projectId,
          type: "project_review",
          frequency: "monthly",
          nextReviewDate: date || new Date().toISOString(),
          status: "pending",
        });
      }

      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Captura rápida</DialogTitle>
          <DialogDescription>
            Guardá lo importante sin romper el foco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {kinds.map((k) => (
            <Button
              key={k.id}
              type="button"
              variant={kind === k.id ? "default" : "outline"}
              className="h-auto flex-col gap-1 py-3 text-xs"
              onClick={() => {
                setKind(k.id);
                setError("");
              }}
            >
              <k.icon className="size-4" />
              {k.label}
            </Button>
          ))}
        </div>
        <form action={save} className="space-y-4">
          <Field label="Título">
            <Input
              name="title"
              autoFocus
              placeholder={
                kind === "task"
                  ? "¿Cuál es la próxima acción?"
                  : "Nombre claro y breve"
              }
            />
          </Field>
          {["project", "idea"].includes(kind) && (
            <Field label="Descripción">
              <Textarea name="description" placeholder="Contexto esencial..." />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {kind === "project" ? (
              <>
                <Picker
                  name="areaId"
                  label="Área"
                  options={data.areas.map((a) => [a.id, a.name])}
                />
                <Picker
                  name="status"
                  label="Estado"
                  options={[
                    ["idea", "Idea"],
                    ["active", "Activo"],
                    ["paused", "Pausado"],
                  ]}
                />
              </>
            ) : (
              <Picker
                name="projectId"
                label="Proyecto (opcional)"
                options={data.projects
                  .filter((p) => !p.isFrozen)
                  .map((p) => [p.id, p.name])}
                optional
              />
            )}
            {["task", "project", "idea"].includes(kind) && (
              <Picker
                name="priority"
                label={kind === "idea" ? "Potencial" : "Prioridad"}
                options={[
                  ["critical", "Crítica"],
                  ["high", "Alta"],
                  ["medium", "Media"],
                  ["low", "Baja"],
                ]}
              />
            )}
            {["task", "idea", "asset", "due", "review"].includes(kind) && (
              <Field label={kind === "asset" ? "Renovación" : "Fecha"}>
                <Input type="date" name="date" />
              </Field>
            )}
          </div>
          {kind === "project" && (
            <Field label="Próxima acción">
              <Input
                name="nextAction"
                placeholder="Ej: Definir módulos mínimos del MVP"
              />
            </Field>
          )}
          {["asset", "due"].includes(kind) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="provider" placeholder="Proveedor" />
              <Input name="type" placeholder="Tipo: dominio, hosting..." />
            </div>
          )}
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creando..." : `Crear ${kinds.find((k) => k.id === kind)?.label.toLowerCase()}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  name,
  label,
  options,
  optional,
}: {
  name: string;
  label: string;
  options: string[][];
  optional?: boolean;
}) {
  return (
    <Field label={label}>
      <Select name={name} defaultValue={optional ? "none" : options[0]?.[0]}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {optional && (
            <SelectItem value="none">Sin asignar / Inbox</SelectItem>
          )}
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
