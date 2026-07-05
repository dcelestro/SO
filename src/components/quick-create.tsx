"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function QuickCreate({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Captura rápida</DialogTitle>
          <DialogDescription>
            La captura rápida queda reservada para tareas, proyectos, ideas y activos desde sus pantallas específicas.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
