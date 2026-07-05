"use client";

import { useState, useTransition } from "react";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { deleteAsset } from "@/actions/assets";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
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

type AssetActionMenuProps = {
  asset: any;
  projects: any[];
  areas: any[];
  onUpdated?: (asset: any) => void;
  onDeleted?: (assetId: string) => void;
};

export function AssetActionMenu({
  asset,
  projects,
  areas,
  onUpdated,
  onDeleted,
}: AssetActionMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      setError("");
      try {
        await deleteAsset(asset.id);
        onDeleted?.(asset.id);
        setDeleteOpen(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar el activo.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            aria-label="Abrir acciones del activo"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssetFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        asset={asset}
        projects={projects}
        areas={areas}
        onSaved={onUpdated}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar activo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción elimina la referencia operativa del activo en Nexo. No borra nada en el proveedor ni en La Caja.
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
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
            >
              {pending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
