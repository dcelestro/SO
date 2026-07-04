"use client";
import { useState, useTransition } from "react";
import { createArea, updateArea } from "@/actions/areas";
import { createProject, updateProject } from "@/actions/projects";
import { createModule, updateModule } from "@/actions/modules";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExplorerArea, ExplorerModule, ExplorerProject } from "@/lib/explorer-types";

type Kind = "area" | "project" | "module";
type Entity = ExplorerArea | ExplorerProject | ExplorerModule;
export function ExplorerFormDialog({ kind, open, onOpenChange, entity, areaId, projectId, onSaved }: { kind: Kind; open: boolean; onOpenChange: (open: boolean) => void; entity?: Entity; areaId?: string; projectId?: string; onSaved: (type: Kind, id: string) => void }) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const isArea = kind === "area"; const current = entity as Partial<ExplorerArea & ExplorerProject & ExplorerModule> | undefined;
  const [name, setName] = useState(current?.name ?? ""); const [description, setDescription] = useState(current?.description ?? "");
  const [color, setColor] = useState(current?.color ?? "#475569");
  const [status, setStatus] = useState<string>(current?.status ?? (isArea ? "active" : kind === "project" ? "idea" : "planned"));
  const [priority, setPriority] = useState<string>(current?.priority ?? "medium"); const [nextAction, setNextAction] = useState(current?.nextAction ?? "");
  const [blockedReason, setBlockedReason] = useState(current?.blockedReason ?? ""); const [progress, setProgress] = useState(current?.progressPercentage ?? 0);
  const statuses = isArea ? [["active", "Activa"], ["paused", "Pausada"], ["archived", "Archivada"]] : kind === "project" ? [["idea", "Idea"], ["analysis", "Análisis"], ["active", "Activo"], ["paused", "Pausado"], ["blocked", "Bloqueado"], ["frozen", "Congelado"], ["completed", "Completado"]] : [["planned", "Planificado"], ["active", "Activo"], ["paused", "Pausado"], ["blocked", "Bloqueado"], ["completed", "Completado"]];
  const [isPending, startTransition] = useTransition();
  function save() {
    setError("");
    startTransition(async () => {
      const payload = isArea
        ? { name, description, color, status }
        : {
            name,
            description,
            status,
            priority,
            nextAction,
            blockedReason,
            progressPercentage: Number(progress),
            areaId: areaId ?? current?.areaId,
            ...(kind === "module" ? { projectId: projectId ?? current?.projectId } : {}),
          };
      try {
        let resultId = "";
        if (kind === "area") {
          const res = entity ? await updateArea(entity.id, payload) : await createArea(payload);
          resultId = res.id;
        } else if (kind === "project") {
          const res = entity ? await updateProject(entity.id, payload) : await createProject(payload);
          resultId = res.id;
        } else {
          const res = entity ? await updateModule(entity.id, payload) : await createModule(payload);
          resultId = res.id;
        }
        onSaved(kind, resultId);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar.");
      }
    });
  }
  const label = isArea ? "área" : kind === "project" ? "proyecto" : "módulo";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{entity ? "Editar" : "Crear"} {label}</DialogTitle><DialogDescription>Los cambios se guardan en la estructura real de Nexo.</DialogDescription></DialogHeader><div className="space-y-4 py-2">
    <Field label="Nombre"><Input aria-label="Nombre" value={name} onChange={(event) => setName(event.target.value)} /></Field>
    <Field label="Descripción"><Textarea aria-label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
    <div className="grid gap-4 sm:grid-cols-2">{isArea && <Field label="Color"><Input aria-label="Color" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></Field>}<Field label="Estado"><Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field>{!isArea && <Field label="Prioridad"><Select value={priority} onValueChange={setPriority}><SelectTrigger aria-label="Prioridad"><SelectValue /></SelectTrigger><SelectContent>{[["critical", "Crítica"], ["high", "Alta"], ["medium", "Media"], ["low", "Baja"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field>}</div>
    {!isArea && <><Field label="Próxima acción"><Input aria-label="Próxima acción" value={nextAction} onChange={(event) => setNextAction(event.target.value)} /></Field><Field label="Motivo de bloqueo"><Input aria-label="Motivo de bloqueo" value={blockedReason} onChange={(event) => setBlockedReason(event.target.value)} /></Field><Field label={`Progreso: ${progress}%`}><Input aria-label="Progreso" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></Field></>}
    {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={save} disabled={isPending}>{isPending ? "Guardando…" : "Guardar"}</Button></DialogFooter></DialogContent></Dialog>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
