"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Edit2, Eye, MoreHorizontal, Play, Snowflake } from "lucide-react";
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
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { useUpdateProjectMutation } from "@/hooks/use-queries";

type ProjectActionMenuProps = {
  project: any;
  areas: any[];
  showView?: boolean;
  onUpdated?: (project: any) => void;
  onArchived?: (projectId: string) => void;
  onEditOpenChange?: (open: boolean) => void;
};

export function ProjectActionMenu({
  project,
  areas,
  showView = true,
  onUpdated,
  onArchived,
  onEditOpenChange,
}: ProjectActionMenuProps) {
  const router = useRouter();
  const updateProject = useUpdateProjectMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const isFrozen = project.status === "frozen" || project.isFrozen;
  const usesExternalEditDialog = Boolean(onEditOpenChange);

  function setEditDialogOpen(open: boolean) {
    if (usesExternalEditDialog) {
      onEditOpenChange?.(open);
      return;
    }

    setEditOpen(open);
  }

  function mutateProject(payload: Record<string, unknown>, afterUpdate?: (updatedProject: any) => void) {
    updateProject.mutate(
      { id: project.id, payload },
      {
        onSuccess: (updatedProject) => {
          const merged = { ...project, ...updatedProject };
          onUpdated?.(merged);
          afterUpdate?.(merged);
          router.refresh();
        },
      },
    );
  }

  function freezeProject() {
    mutateProject(
      {
        status: "frozen",
        isFrozen: true,
        frozenReason: project.frozenReason || "Pausa consciente para reducir frentes abiertos",
        frozenUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      () => setFreezeOpen(false),
    );
  }

  function resumeProject() {
    mutateProject({
      status: project.nextAction ? "active" : "paused",
      nextAction: project.nextAction ?? null,
      isFrozen: false,
      frozenReason: null,
      frozenUntil: null,
    });
  }

  function archiveProject() {
    mutateProject(
      {
        status: "discarded",
        isFrozen: false,
        frozenReason: null,
        frozenUntil: null,
      },
      () => {
        onArchived?.(project.id);
        setArchiveOpen(false);
        router.refresh();
      },
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            aria-label="Abrir acciones del proyecto"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {showView ? (
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>
                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                <span>Ver detalle</span>
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isFrozen ? (
            <DropdownMenuItem onClick={resumeProject} disabled={updateProject.isPending}>
              <Play className="mr-2 h-4 w-4 text-slate-500" />
              <span>Reanudar</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setFreezeOpen(true)}>
              <Snowflake className="mr-2 h-4 w-4 text-slate-500" />
              <span>Congelar</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
            <Archive className="mr-2 h-4 w-4 text-slate-500" />
            <span>Archivar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!usesExternalEditDialog ? (
        <ProjectFormModal
          open={editOpen}
          onOpenChange={setEditDialogOpen}
          project={project}
          areas={areas}
          onSaved={(savedProject) => onUpdated?.(savedProject)}
        />
      ) : null}

      <AlertDialog open={freezeOpen} onOpenChange={setFreezeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congelar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              El proyecto saldrá del trabajo activo y quedará pausado para reducir frentes abiertos. Se registrará una revisión dentro de 30 días.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateProject.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); freezeProject(); }} disabled={updateProject.isPending}>
              {updateProject.isPending ? "Congelando..." : "Congelar proyecto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              El proyecto dejará de aparecer como proyecto activo, pero no se borrará la información asociada. Usá esta opción para proyectos cerrados, descartados o fuera de alcance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateProject.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); archiveProject(); }} disabled={updateProject.isPending}>
              {updateProject.isPending ? "Archivando..." : "Archivar proyecto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
