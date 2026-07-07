"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
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

const statusLabels: Record<BoardStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  archived: "Archivado",
};

export function BoardsLibrary() {
  const [boards, setBoards] = useState<VisualBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteBoard, setDeleteBoard] = useState<VisualBoard | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/boards", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar las pizarras.");
        return response.json() as Promise<VisualBoard[]>;
      })
      .then((data) => {
        if (active) setBoards(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las pizarras.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function removeBoard() {
    if (!deleteBoard) return;

    setDeleting(true);
    setError("");
    const response = await fetch(`/api/boards/${deleteBoard.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar la pizarra.");
      return;
    }

    setBoards((current) => current.filter((board) => board.id !== deleteBoard.id));
    setDeleteBoard(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pizarras y diagramas</h1>
        </div>
      </header>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400">
          Cargando pizarras…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700">{error}</div>
      ) : boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">Todavía no hay pizarras.</p>
          <p className="mt-1 text-sm text-slate-500">Creá la primera desde un área, proyecto o módulo del Explorador.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {boards.map((board) => (
            <article key={board.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-slate-900">{board.title}</h2>
                  <Badge variant="outline">{typeLabels[board.type]}</Badge>
                  <Badge variant="outline">{statusLabels[board.status]}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {[board.area.name, board.project?.name, board.module?.name].filter(Boolean).join(" / ")}
                </p>
                <p className="mt-2 line-clamp-1 text-sm text-slate-600">{board.description || "Sin descripción"}</p>
              </div>
              <div className="flex shrink-0 gap-2 self-start sm:self-auto">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/boards/${board.id}`}>
                    Abrir
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setDeleteBoard(board)}>
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

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
    </div>
  );
}
