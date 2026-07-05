"use client";

import { useState, useTransition } from "react";
import { Check, Edit2, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { deleteDueItem, markDueItemDone, updateDueItem } from "@/actions/dues";
import { VencimientoFormModal } from "@/components/vencimientos/vencimiento-form-modal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function VencimientoActionMenu({ item, projects, assets, onUpdated, onDeleted }: { item: any; projects: any[]; assets: any[]; onUpdated?: (item: any) => void; onDeleted?: (id: string) => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function done() {
    startTransition(async () => {
      setError("");
      try {
        const updated = await markDueItemDone(item.id);
        onUpdated?.(updated);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo marcar como realizado.");
      }
    });
  }

  function cancel() {
    startTransition(async () => {
      setError("");
      try {
        const updated = await updateDueItem(item.id, { status: "cancelled" });
        onUpdated?.(updated);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo cancelar el vencimiento.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      setError("");
      try {
        await deleteDueItem(item.id);
        onDeleted?.(item.id);
        setDeleteOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar el vencimiento.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" aria-label="Abrir acciones de vencimiento">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setEditOpen(true)}><Edit2 className="mr-2 h-4 w-4 text-slate-500" />Editar</DropdownMenuItem>
          {item.status !== "done" ? <DropdownMenuItem onClick={done} disabled={pending}><Check className="mr-2 h-4 w-4 text-slate-500" />Marcar realizado</DropdownMenuItem> : null}
          {item.status !== "cancelled" ? <DropdownMenuItem onClick={cancel} disabled={pending}><XCircle className="mr-2 h-4 w-4 text-slate-500" />Cancelar</DropdownMenuItem> : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VencimientoFormModal open={editOpen} onOpenChange={setEditOpen} item={item} projects={projects} assets={assets} onSaved={onUpdated} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vencimiento</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Usala solo para vencimientos duplicados o creados por error.</AlertDialogDescription>
          </AlertDialogHeader>
          {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" disabled={pending} onClick={(event) => { event.preventDefault(); remove(); }}>
              {pending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
