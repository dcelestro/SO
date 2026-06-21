"use client";
import { useState } from "react";
import { nanoid } from "@/lib/id";
import { useData } from "@/components/data-provider";
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
export function QuickCreate({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, setData } = useData();
  const [kind, setKind] = useState("task"),
    [error, setError] = useState("");
  function save(fd: FormData) {
    const title = String(fd.get("title") || "").trim(),
      rawProject = String(fd.get("projectId") || ""),
      projectId = rawProject === "none" ? undefined : rawProject || undefined,
      areaId =
        String(fd.get("areaId") || "") ||
        data.projects.find((p) => p.id === projectId)?.areaId;
    if (!title) {
      setError("Escribí un título concreto.");
      return;
    }
    const id = nanoid(),
      now = new Date().toISOString(),
      date = String(fd.get("date") || "") || undefined,
      priority = String(fd.get("priority") || "medium");
    if (kind === "project") {
      const status = String(fd.get("status") || "idea"),
        nextAction = String(fd.get("nextAction") || "").trim();
      if (!areaId) {
        setError("Seleccioná un área.");
        return;
      }
      if (status === "active" && !nextAction) {
        setError(
          "Todo proyecto activo debe tener una próxima acción concreta.",
        );
        return;
      }
      setData((d) => ({
        ...d,
        projects: [
          {
            id,
            name: title,
            description: String(fd.get("description") || ""),
            areaId,
            status,
            priority,
            maturity: "idea",
            projectType: "other",
            nextAction: nextAction || undefined,
            progressPercentage: 0,
            updatedAt: now,
          },
          ...d.projects,
        ],
      }));
    } else if (kind === "task")
      setData((d) => ({
        ...d,
        tasks: [
          {
            id,
            title,
            projectId,
            status: projectId ? "pending" : "inbox",
            priority,
            dueDate: date,
          },
          ...d.tasks,
        ],
      }));
    else if (kind === "idea")
      setData((d) => ({
        ...d,
        ideas: [
          {
            id,
            title,
            description: String(fd.get("description") || ""),
            areaId,
            potential: priority,
            complexity: "medium",
            status: "captured",
            reviewDate: date,
          },
          ...d.ideas,
        ],
      }));
    else if (kind === "asset")
      setData((d) => ({
        ...d,
        assets: [
          {
            id,
            name: title,
            projectId,
            type: String(fd.get("type") || "other"),
            provider: String(fd.get("provider") || ""),
            renewalDate: date,
            status: "active",
          },
          ...d.assets,
        ],
      }));
    else if (kind === "due")
      setData((d) => ({
        ...d,
        dues: [
          {
            id,
            title,
            projectId,
            type: String(fd.get("type") || "other"),
            dueDate: date || now,
            status: "pending",
          },
          ...d.dues,
        ],
      }));
    else
      setData((d) => ({
        ...d,
        reviews: [
          {
            id,
            title,
            projectId,
            type: "project_review",
            frequency: "monthly",
            nextReviewDate: date || now,
            status: "pending",
          },
          ...d.reviews,
        ],
      }));
    const resource = {
      project: "projects",
      task: "tasks",
      idea: "ideas",
      asset: "assets",
      due: "due-items",
      review: "reviews",
    }[kind];
    const payload = Object.fromEntries(
      [...fd.entries()].filter(([, value]) => value !== "" && value !== "none"),
    );
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) => !["title", "date"].includes(key),
      ),
    );
    const apiPayload =
      kind === "project"
        ? {
            ...cleanPayload,
            name: title,
            areaId,
            maturity: "idea",
            projectType: "other",
          }
        : kind === "task"
          ? {
              ...cleanPayload,
              title,
              projectId,
              dueDate: date,
              status: projectId ? "pending" : "inbox",
            }
          : kind === "idea"
            ? {
                ...cleanPayload,
                title,
                areaId,
                potential: priority,
                complexity: "medium",
                status: "captured",
                reviewDate: date,
              }
            : kind === "asset"
              ? {
                  ...cleanPayload,
                  name: title,
                  projectId,
                  renewalDate: date,
                  status: "active",
                  type: payload.type || "other",
                }
              : kind === "due"
                ? {
                    ...cleanPayload,
                    title,
                    projectId,
                    dueDate: date || now,
                    status: "pending",
                    recurrence: "none",
                    type: payload.type || "other",
                  }
                : {
                    ...cleanPayload,
                    title,
                    projectId,
                    nextReviewDate: date || now,
                    status: "pending",
                    frequency: "monthly",
                    type: "project_review",
                  };
    if (resource) {
      void fetch(`/api/${resource}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(apiPayload),
      });
    }
    setError("");
    onOpenChange(false);
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
            )}{" "}
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
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear {kinds.find((k) => k.id === kind)?.label.toLowerCase()}
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
