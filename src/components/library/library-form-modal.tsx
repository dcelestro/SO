"use client";

import { useState, useTransition } from "react";
import { createLibraryItem, updateLibraryItem } from "@/actions/library";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LibraryItem, LibraryItemType, LibraryItemCategory, LibraryItemStatus } from "@prisma/client";

export function LibraryFormModal({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LibraryItem;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [type, setType] = useState<LibraryItemType>(item?.type ?? "prompt");
  const [category, setCategory] = useState<LibraryItemCategory>(item?.category ?? "prompts");
  const [status, setStatus] = useState<LibraryItemStatus>(item?.status ?? "active");
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [variables, setVariables] = useState(item?.variables.join(", ") ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      setError("");
      try {
        const payload = {
          title,
          description,
          type,
          category,
          status,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          variables: variables.split(",").map((v) => v.trim()).filter(Boolean),
          content,
        };
        if (item) {
          await updateLibraryItem(item.id, payload);
        } else {
          await createLibraryItem(payload);
        }
        onSaved();
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar el ítem de la biblioteca.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Template" : "Nuevo Template"}</DialogTitle>
          <DialogDescription>
            Guarda materiales reutilizables. Usa placeholders como {"{{VARIABLE}}"} para parámetros. No incluyas secretos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Título">
            <Input aria-label="Título" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Descripción">
            <Input aria-label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <Select value={type} onValueChange={(value) => setType(value as LibraryItemType)}>
                <SelectTrigger aria-label="Tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["prompt", "Prompt"],
                    ["document_template", "Plantilla de documento"],
                    ["client_message", "Mensaje a cliente"],
                    ["checklist", "Checklist"],
                    ["dev_issue", "Issue para Dev"],
                    ["functional_spec", "Spec Funcional"],
                    ["technical_spec", "Spec Técnica"],
                    ["report", "Reporte"],
                    ["email", "Email"],
                    ["other", "Otro"],
                  ].map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Categoría">
              <Select value={category} onValueChange={(value) => setCategory(value as LibraryItemCategory)}>
                <SelectTrigger aria-label="Categoría">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["desarrollo", "Desarrollo"],
                    ["documentacion", "Documentación"],
                    ["clientes", "Clientes"],
                    ["comercial", "Comercial"],
                    ["testing", "Testing"],
                    ["operacion", "Operación"],
                    ["prompts", "Prompts"],
                    ["otros", "Otros"],
                  ].map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags (separados por coma)">
              <Input aria-label="Tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="agile, qa, reporte..." />
            </Field>
            <Field label="Variables (separadas por coma)">
              <Input aria-label="Variables" value={variables} onChange={(event) => setVariables(event.target.value)} placeholder="{{cliente}}, {{fecha}}..." />
            </Field>
          </div>
          <Field label="Contenido (Template)">
            <Textarea
              aria-label="Contenido"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="Escribe el contenido aquí..."
            />
          </Field>
          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
