"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useUpdateProjectMutation } from "@/hooks/use-queries";

const statuses = [
  ["idea", "Idea"],
  ["analysis", "Análisis"],
  ["active", "Activo"],
  ["paused", "Pausado"],
  ["blocked", "Bloqueado"],
  ["frozen", "Congelado"],
  ["completed", "Completado"],
] as const;

const priorities = [
  ["critical", "Crítica"],
  ["high", "Alta"],
  ["medium", "Media"],
  ["low", "Baja"],
] as const;

const maturities = [
  ["idea", "Idea"],
  ["validation", "Validación"],
  ["design", "Diseño"],
  ["development", "Desarrollo"],
  ["testing", "Pruebas"],
  ["production", "Producción"],
  ["maintenance", "Mantenimiento"],
] as const;

const projectTypes = [
  ["app", "App"],
  ["web", "Web"],
  ["ecommerce", "Ecommerce"],
  ["newsletter", "Newsletter"],
  ["infrastructure", "Infraestructura"],
  ["admin", "Administrativo"],
  ["content", "Contenido"],
  ["business", "Negocio"],
  ["other", "Otro"],
] as const;

function dateValue(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

type ProjectFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  areas: any[];
  onSaved?: (project: any) => void;
};

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
  areas,
  onSaved,
}: ProjectFormModalProps) {
  const queryClient = useQueryClient();
  const updateProject = useUpdateProjectMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("medium");
  const [maturity, setMaturity] = useState("idea");
  const [projectType, setProjectType] = useState("other");
  const [nextAction, setNextAction] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progressPercentage, setProgressPercentage] = useState("0");
  const [error, setError] = useState("");

  const areaOptions = areas.length
    ? areas
    : project?.area
      ? [project.area]
      : [];

  useEffect(() => {
    if (!open || !project) return;

    setName(project.name ?? "");
    setDescription(project.description ?? "");
    setAreaId(project.areaId ?? project.area?.id ?? "");
    setStatus(project.status ?? "active");
    setPriority(project.priority ?? "medium");
    setMaturity(project.maturity ?? "idea");
    setProjectType(project.projectType ?? "other");
    setNextAction(project.nextAction ?? "");
    setBlockedReason(project.blockedReason ?? "");
    setTargetDate(dateValue(project.targetDate));
    setProgressPercentage(String(project.progressPercentage ?? 0));
    setError("");
  }, [open, project]);

  function save() {
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      areaId,
      status,
      priority,
      maturity,
      projectType,
      nextAction: nextAction.trim() || null,
      blockedReason: blockedReason.trim() || null,
      targetDate: targetDate || null,
      progressPercentage: Number(progressPercentage || 0),
      isFrozen: status === "frozen",
    };

    updateProject.mutate(
      { id: project.id, payload },
      {
        onSuccess: async (savedProject) => {
          await queryClient.invalidateQueries({ queryKey: ["projects"] });
          onSaved?.({
            ...project,
            ...savedProject,
            area: areaOptions.find((area) => area.id === areaId) ?? project.area,
          });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(cause instanceof Error ? cause.message : "No se pudo guardar el proyecto.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar proyecto</DialogTitle>
          <DialogDescription>
            Ajustá los datos operativos del proyecto sin cambiar su estructura interna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Área">
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Estado">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prioridad">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Madurez">
              <Select value={maturity} onValueChange={setMaturity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maturities.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo">
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Próxima acción">
            <Input value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
          </Field>

          <Field label="Motivo de bloqueo">
            <Input
              value={blockedReason}
              onChange={(event) => setBlockedReason(event.target.value)}
              placeholder="Solo necesario si el proyecto está bloqueado"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha objetivo">
              <Input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </Field>

            <Field label="Progreso">
              <Input
                type="number"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(event) => setProgressPercentage(event.target.value)}
              />
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
          <Button onClick={save} disabled={updateProject.isPending}>
            {updateProject.isPending ? "Guardando..." : "Guardar"}
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
