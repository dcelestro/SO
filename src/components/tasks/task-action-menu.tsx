"use client";

import { useState } from "react";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { useDeleteTaskMutation } from "@/hooks/use-queries";
import type { ExplorerTask } from "@/lib/task-types";

type TaskActionMenuProps = {
  task: ExplorerTask;
  className?: string;
  onUpdated?: (task: unknown) => void;
  onDeleted?: (taskId: string) => void;
};

export function TaskActionMenu({
  task,
  className,
  onUpdated,
  onDeleted,
}: TaskActionMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  function handleDelete() {
    deleteTask(task.id, {
      onSuccess: () => {
        onDeleted?.(task.id);
        setDeleteOpen(false);
      },
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 text-slate-500 hover:text-slate-900 ${className ?? ""}`}
            aria-label="Abrir acciones de tarea"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        areaId={task.areaId ?? null}
        projectId={task.projectId ?? null}
        moduleId={task.moduleId ?? null}
        onSaved={(savedTask) => {
          onUpdated?.(savedTask);
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo eliminá tareas creadas por error o duplicadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
