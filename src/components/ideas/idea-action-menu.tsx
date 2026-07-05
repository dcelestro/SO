"use client";

import { useState, useTransition } from "react";
import { Archive, ArrowRight, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { deleteIdea, promoteIdeaToProject, updateIdea } from "@/actions/ideas";
import { IdeaFormModal } from "@/components/ideas/idea-form-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IdeaActionMenuProps = {
  idea: any;
  projects: any[];
  areas: any[];
  onUpdated?: (idea: any) => void;
  onDeleted?: (ideaId: string) => void;
  onPromoted?: (payload: { idea: any; project: any }) => void;
};

export function IdeaActionMenu({
  idea,
  projects,
  areas,
  onUpdated,
  onDeleted,
  onPromoted,
}: IdeaActionMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteAreaId, setPromoteAreaId] = useState(idea.areaId || areas[0]?.id || "");
  const [projectName, setProjectName] = useState(idea.title || "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function archive() {
    startTransition(async () => {
      setError("");
      try {
        const updated = await updateIdea(idea.id, { status: "archived" });
        onUpdated?.(updated);
        setArchiveOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo archivar la idea.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      setError("");
      try {
        await deleteIdea(idea.id);
        onDeleted?.(idea.id);
        setDeleteOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar la idea.");
      }
    });
  }

  function promote() {
    startTransition(async () => {
      setError("");
      try {
        if (!promoteAreaId) throw new Error("Seleccioná un área para crear el proyecto.");
        const result = await promoteIdeaToProject(idea.id, promoteAreaId, projectName);
        onPromoted?.(result);
        setPromoteOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo promover la idea.");
      }
    });
  }

  const canPromote = idea.status !== "promoted";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            aria-label="Abrir acciones de idea"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
            <span>Editar</span>
          </DropdownMenuItem>
          {canPromote ? (
            <DropdownMenuItem onClick={() => setPromoteOpen(true)}>
              <ArrowRight className="mr-2 h-4 w-4 text-slate-500" />
              <span>Convertir en proyecto</span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
            <Archive className="mr-2 h-4 w-4 text-slate-500" />
            <span>Archivar</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IdeaFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        idea={idea}
        projects={projects}
        areas={areas}
        onSaved={onUpdated}
      />

      <AlertDialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir idea en proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará un proyecto nuevo y la idea quedará vinculada como promovida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre del proyecto</Label>
              <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Área</Label>
              <Select value={promoteAreaId} onValueChange={setPromoteAreaId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar área" /></SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); promote(); }}>
              {pending ? "Creando..." : "Crear proyecto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar idea</AlertDialogTitle>
            <AlertDialogDescription>
              La idea saldrá del flujo activo pero quedará guardada para consulta futura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); archive(); }}>
              {pending ? "Archivando..." : "Archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar idea</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Usala solo para ideas duplicadas o creadas por error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={pending}
              onClick={(event) => { event.preventDefault(); remove(); }}
            >
              {pending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
