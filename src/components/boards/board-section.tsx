"use client";

import { useEffect, useState } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BoardCanvasEditor } from "@/components/boards/board-canvas-editor";
import { BoardFormModal } from "@/components/boards/board-form-modal";
import type { BoardStatus, BoardType, VisualBoard } from "@/lib/board-types";

const typeLabels: Record<BoardType, string> = {
  whiteboard: "Pizarra",
  flowchart: "Diagrama de flujo",
  architecture: "Arquitectura",
  process: "Proceso",
  mindmap: "Mapa mental",
  notes: "Notas visuales",
  other: "Otro",
};

const statusLabels: Record<BoardStatus, string> = { draft: "Borrador", active: "Activo", archived: "Archivado" };

export function BoardSection({ areaId, projectId, moduleId }: { areaId: string; projectId?: string; moduleId?: string }) {
  const [boards, setBoards] = useState<VisualBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [formBoard, setFormBoard] = useState<VisualBoard | "new" | null>(null);
  const [openBoard, setOpenBoard] = useState<VisualBoard | null>(null);
  const [deleteBoard, setDeleteBoard] = useState<VisualBoard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ areaId, direct: "true" });
    if (projectId) params.set("projectId", projectId);
    if (moduleId) params.set("moduleId", moduleId);

    fetch(`/api/boards?${params}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (active) setBoards(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [areaId, projectId, moduleId, refresh]);

  const mutate = () => setRefresh((value) => value + 1);

  async function removeBoard() {
    if (!deleteBoard) return;

    setDeleting(true);
    const response = await fetch(`/api/boards/${deleteBoard.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) return;
    setBoards((current) => current.filter((board) => board.id !== deleteBoard.id));
    if (openBoard?.id === deleteBoard.id) setOpenBoard(null);
    setDeleteBoard(null);
    mutate();
  }

  const empty = moduleId
    ? "No hay documentación visual asociada."
    : projectId
      ? "Todavía no hay documentación visual asociada a este proyecto."
      : "Todavía no hay documentación visual asociada a esta área.";

  return (
    <section className="border-b border-slate-200 py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Pizarras y diagramas</h2>
          <p className="mt-1 text-xs text-slate-500">Documentación visual · {boards.length} asociadas</p>
        </div>
        <Button size="sm" onClick={() => setFormBoard("new")}>
          <Plus className="size-4" />
          Crear pizarra
        </Button>
      </div>

      {loading ? (
        <p className="py-5 text-sm text-slate-400">Cargando pizarras…</p>
      ) : boards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">{empty}</div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {boards.map((board) => (
            <div key={board.id} className="flex items-start gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{board.title}</p>
                  <Badge variant="outline" className="text-[10px]">{typeLabels[board.type]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{statusLabels[board.status]}</Badge>
                </div>
                {!moduleId ? <p className="mt-1 truncate text-xs text-slate-400">{[board.area.name, board.project?.name, board.module?.name].filter(Boolean).join(" / ")}</p> : null}
                <p className="mt-1 text-xs text-slate-500">{board.description || "Sin descripción"} · Actualizado {new Intl.DateTimeFormat("es-AR").format(new Date(board.updatedAt))}</p>
                <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline" onClick={() => setOpenBoard(board)}>
                  Abrir <Eye className="size-3" />
                </button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Acciones de ${board.title}`}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenBoard(board)}>
                    <Eye className="size-4" />
                    Abrir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormBoard(board)}>
                    <Pencil className="size-4" />
                    Editar datos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-700" onClick={() => setDeleteBoard(board)}>
                    <Trash2 className="size-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {formBoard ? (
        <BoardFormModal
          key={formBoard === "new" ? "new" : formBoard.id}
          open
          onOpenChange={(open) => !open && setFormBoard(null)}
          board={formBoard === "new" ? undefined : formBoard}
          areaId={areaId}
          projectId={projectId}
          moduleId={moduleId}
          onSaved={(board) => {
            mutate();
            setOpenBoard(board);
          }}
        />
      ) : null}

      <Dialog open={!!openBoard} onOpenChange={(open) => !open && setOpenBoard(null)}>
        <DialogContent className="h-[min(88vh,860px)] p-0 sm:max-w-[min(96vw,1240px)]">
          <DialogHeader className="sr-only">
            <DialogTitle>{openBoard?.title}</DialogTitle>
            <DialogDescription>Editor de pizarra</DialogDescription>
          </DialogHeader>
          {openBoard ? (
            <BoardCanvasEditor
              board={openBoard}
              onSaved={(board) => {
                setOpenBoard(board);
                setBoards((current) => current.map((item) => (item.id === board.id ? board : item)));
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBoard} onOpenChange={(open) => !open && setDeleteBoard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar la pizarra “{deleteBoard?.title ?? "seleccionada"}”. Esta acción borra la pizarra completa y no la deja archivada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={removeBoard} className="bg-red-600 text-white hover:bg-red-700">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
