"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type {
  ExplorerTask,
  TaskContext,
  TaskEnergy,
  TaskStatus,
} from "@/lib/task-types";
import type { Priority } from "@/lib/explorer-types";

type TaskFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: ExplorerTask;
  areaId?: string | null;
  projectId?: string | null;
  moduleId?: string | null;
  onSaved?: (task: unknown) => void;
};

const dateValue = (value: string | Date | null | undefined) => {
  if (!value) return "";

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
};

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  areaId,
  projectId,
  moduleId,
  onSaved,
}: TaskFormModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [energyLevel, setEnergyLevel] = useState<TaskEnergy | "none">("none");
  const [context, setContext] = useState<TaskContext | "none">("none");
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus((task?.status ?? "pending") as TaskStatus);
    setPriority((task?.priority ?? "medium") as Priority);
    setDueDate(dateValue(task?.dueDate));
    setStartDate(dateValue(task?.startDate));
    setEstimatedMinutes(task?.estimatedMinutes?.toString() ?? "");
    setEnergyLevel((task?.energyLevel ?? "none") as TaskEnergy | "none");
    setContext((task?.context ?? "none") as TaskContext | "none");
    setError("");
  }, [open, task]);

  function save() {
    startTransition(async () => {
      setError("");

      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          areaId: areaId ?? task?.areaId ?? null,
          projectId: projectId ?? task?.projectId ?? null,
          moduleId: moduleId ?? task?.moduleId ?? null,
          status,
          priority,
          dueDate: dueDate || null,
          startDate: startDate || null,
          estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
          energyLevel: energyLevel === "none" ? null : energyLevel,
          context: context === "none" ? null : context,
        };

        const savedTask = task
          ? await updateTask(task.id, payload)
          : await createTask(payload);

        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onSaved?.(savedTask);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar la tarea.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Crear tarea"}</DialogTitle>
          <DialogDescription>
            La ubicación jerárquica se asigna automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Título">
            <Input
              aria-label="Título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              aria-label="Descripción de tarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado">
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger aria-label="Estado de tarea">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["inbox", "Inbox"],
                    ["pending", "Pendiente"],
                    ["in_progress", "En progreso"],
                    ["waiting", "En espera"],
                    ["blocked", "Bloqueada"],
                    ["completed", "Completada"],
                  ].map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Prioridad">
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger aria-label="Prioridad de tarea">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["critical", "Crítica"],
                    ["high", "Alta"],
                    ["medium", "Media"],
                    ["low", "Baja"],
                  ].map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de inicio">
              <Input
                aria-label="Fecha de inicio"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>

            <Field label="Vencimiento">
              <Input
                aria-label="Fecha de vencimiento"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Minutos estimados">
              <Input
                aria-label="Minutos estimados"
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={(event) => setEstimatedMinutes(event.target.value)}
              />
            </Field>

            <Field label="Energía">
              <Select
                value={energyLevel}
                onValueChange={(value) => setEnergyLevel(value as TaskEnergy | "none")}
              >
                <SelectTrigger aria-label="Nivel de energía">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin definir</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Contexto">
              <Select
                value={context}
                onValueChange={(value) => setContext(value as TaskContext | "none")}
              >
                <SelectTrigger aria-label="Contexto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["none", "Sin definir"],
                    ["development", "Desarrollo"],
                    ["design", "Diseño"],
                    ["research", "Investigación"],
                    ["admin", "Administración"],
                    ["commercial", "Comercial"],
                    ["content", "Contenido"],
                    ["review", "Revisión"],
                    ["purchase", "Compra"],
                    ["call", "Llamada"],
                    ["other", "Otro"],
                  ].map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
