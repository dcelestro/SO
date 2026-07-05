"use client";

import { useEffect, useState, useTransition } from "react";
import { createIdea, updateIdea } from "@/actions/ideas";
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

const none = "__none__";

const levels = [
  ["high", "Alto"],
  ["medium", "Medio"],
  ["low", "Bajo"],
] as const;

const origins = [
  ["personal", "Personal"],
  ["thirdparty", "Terceros"],
  ["saas", "Producto"],
] as const;

const statuses = [
  ["inbox", "Inbox"],
  ["archived", "Archivada"],
  ["promoted", "Promovida"],
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

type IdeaFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: any;
  projects: any[];
  areas: any[];
  onSaved?: (idea: any) => void;
};

export function IdeaFormModal({
  open,
  onOpenChange,
  idea,
  projects,
  areas,
  onSaved,
}: IdeaFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState(none);
  const [projectId, setProjectId] = useState(none);
  const [potential, setPotential] = useState("medium");
  const [complexity, setComplexity] = useState("medium");
  const [origin, setOrigin] = useState("personal");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("inbox");
  const [reviewDate, setReviewDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setTitle(idea?.title ?? "");
    setDescription(idea?.description ?? "");
    setAreaId(idea?.areaId ?? none);
    setProjectId(idea?.projectId ?? none);
    setPotential(idea?.potential ?? "medium");
    setComplexity(idea?.complexity ?? "medium");
    setOrigin(idea?.origin ?? "personal");
    setDestination(idea?.destination ?? "");
    setStatus(idea?.status ?? "inbox");
    setReviewDate(dateValue(idea?.reviewDate));
    setNotes(idea?.notes ?? "");
    setError("");
  }, [idea, open]);

  function save() {
    startTransition(async () => {
      setError("");

      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          areaId: areaId === none ? null : areaId,
          projectId: projectId === none ? null : projectId,
          potential,
          complexity,
          origin,
          destination: destination.trim() || null,
          status,
          reviewDate: reviewDate || null,
          notes: notes.trim() || null,
        };

        const savedIdea = idea
          ? await updateIdea(idea.id, payload)
          : await createIdea(payload);

        onSaved?.(savedIdea);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar la idea.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{idea ? "Editar idea" : "Nueva idea"}</DialogTitle>
          <DialogDescription>
            Capturá la idea sin convertirla automáticamente en un frente de trabajo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Título">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>

          <Field label="Descripción">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Área">
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Sin área</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Proyecto vinculado">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Sin proyecto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Potencial">
              <Select value={potential} onValueChange={setPotential}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levels.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Complejidad">
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levels.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Origen">
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {origins.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destino / posible uso">
              <Input value={destination} onChange={(event) => setDestination(event.target.value)} />
            </Field>

            <Field label="Estado">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Fecha de revisión">
            <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} />
          </Field>

          <Field label="Notas">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </Field>

          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
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
