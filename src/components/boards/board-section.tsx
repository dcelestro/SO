"use client";
import { useEffect, useState } from "react";
import { Archive, Eye, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const [archiveBoard, setArchiveBoard] = useState<VisualBoard | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
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
  async function archive() {
    if (!archiveBoard) return;
    await fetch(`/api/boards/${archiveBoard.id}`, { method: "DELETE" });
    setArchiveBoard(null);
    mutate();
  }

  const empty = moduleId
    ? "No hay documentación visual asociada."
    : projectId
      ? "Todavía no hay documentación visual asociada a este proyecto."
      : "Todavía no hay documentación visual asociada a esta área.";

  return <section className="border-b border-slate-200 py-6"><div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Pizarras y diagramas</h2><p className="mt-1 text-xs text-slate-500">Documentación visual · {boards.length} asociadas</p></div><Button size="sm" onClick={() => setFormBoard("new")}><Plus className="size-4" />Crear pizarra</Button></div>{loading ? <p className="py-5 text-sm text-slate-400">Cargando pizarras…</p> : boards.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">{empty}</div> : <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">{boards.map((board) => <div key={board.id} className="flex items-start gap-3 px-3 py-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{board.title}</p><Badge variant="outline" className="text-[10px]">{typeLabels[board.type]}</Badge><Badge variant="outline" className="text-[10px]">{statusLabels[board.status]}</Badge></div>{!moduleId && <p className="mt-1 truncate text-xs text-slate-400">{[board.area.name, board.project?.name, board.module?.name].filter(Boolean).join(" / ")}</p>}<p className="mt-1 text-xs text-slate-500">{board.description || "Sin descripción"} · Actualizado {new Intl.DateTimeFormat("es-AR").format(new Date(board.updatedAt))}</p><button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline" onClick={() => setOpenBoard(board)}>Abrir <Eye className="size-3" /></button></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Acciones de ${board.title}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setOpenBoard(board)}><Eye className="size-4" />Abrir</DropdownMenuItem><DropdownMenuItem onClick={() => setFormBoard(board)}><Pencil className="size-4" />Editar datos</DropdownMenuItem><DropdownMenuItem className="text-red-700" onClick={() => setArchiveBoard(board)}><Archive className="size-4" />Archivar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>)}</div>}
    {formBoard && <BoardFormModal key={formBoard === "new" ? "new" : formBoard.id} open onOpenChange={(open) => !open && setFormBoard(null)} board={formBoard === "new" ? undefined : formBoard} areaId={areaId} projectId={projectId} moduleId={moduleId} onSaved={(board) => { mutate(); setOpenBoard(board); }} />}
    <Dialog open={!!openBoard} onOpenChange={(open) => !open && setOpenBoard(null)}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{openBoard?.title}</DialogTitle><DialogDescription>Documentación visual</DialogDescription></DialogHeader>{openBoard && <div className="space-y-4"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{typeLabels[openBoard.type]}</Badge><Badge variant="outline">{statusLabels[openBoard.status]}</Badge></div><p className="text-sm leading-6 text-slate-600">{openBoard.description || "Sin descripción."}</p><div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500"><p className="font-medium text-slate-700">Contexto</p><p className="mt-1">{[openBoard.area.name, openBoard.project?.name, openBoard.module?.name].filter(Boolean).join(" / ")}</p><p className="mt-3 font-medium text-slate-700">Contenido estructurado</p><p className="mt-1">{openBoard.data.nodes.length} nodos · {openBoard.data.edges.length} relaciones</p></div></div>}</DialogContent></Dialog>
    <AlertDialog open={!!archiveBoard} onOpenChange={(open) => !open && setArchiveBoard(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Archivar esta pizarra?</AlertDialogTitle><AlertDialogDescription>Dejará de aparecer entre la documentación visual activa, pero no se eliminará.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={archive}>Archivar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
