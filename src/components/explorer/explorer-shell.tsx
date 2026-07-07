"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArea } from "@/actions/areas";
import { deleteProject } from "@/actions/projects";
import { deleteModule } from "@/actions/modules";
import { ChevronRight, FolderTree, Plus, RefreshCw } from "lucide-react";
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
import { ExplorerDetail } from "@/components/explorer/explorer-detail";
import { ExplorerFormDialog } from "@/components/explorer/explorer-form-dialog";
import { ExplorerTree } from "@/components/explorer/explorer-tree";
import { initialData } from "@/lib/demo-data";
import type { ExplorerArea, ExplorerModule, ExplorerNodeType, ExplorerProject, ExplorerSelection } from "@/lib/explorer-types";

type FormState = { kind: ExplorerNodeType; entity?: ExplorerArea | ExplorerProject | ExplorerModule; areaId?: string; projectId?: string } | null;
type DataSource = "backend" | "demo" | "error";

function demoTree(): ExplorerArea[] {
  return initialData.areas.map((area) => ({
    id: area.id,
    name: area.name,
    description: null,
    color: area.color,
    status: "active",
    projects: initialData.projects.filter((project) => project.areaId === area.id).map((project) => ({
      id: project.id,
      areaId: project.areaId,
      name: project.name,
      description: project.description,
      status: project.status as ExplorerProject["status"],
      priority: project.priority as ExplorerProject["priority"],
      nextAction: project.nextAction ?? null,
      blockedReason: null,
      progressPercentage: project.progressPercentage,
      modules: [],
    })),
  }));
}

function locate(areas: ExplorerArea[], selection: ExplorerSelection): { area?: ExplorerArea; project?: ExplorerProject; module?: ExplorerModule } {
  for (const area of areas) {
    if (selection?.type === "area" && selection.id === area.id) return { area };
    for (const project of area.projects) {
      if (selection?.type === "project" && selection.id === project.id) return { area, project };
      for (const item of project.modules) {
        if (selection?.type === "module" && selection.id === item.id) return { area, project, module: item };
      }
    }
  }
  return {};
}

export function ExplorerShell({ initialSelection, initialAreas }: { initialSelection: ExplorerSelection; initialAreas: ExplorerArea[] }) {
  const router = useRouter();
  const [areas, setAreas] = useState<ExplorerArea[]>(initialAreas);
  const [selection, setSelection] = useState<ExplorerSelection>(initialSelection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<DataSource>("backend");
  const [form, setForm] = useState<FormState>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    setError("");
    setSource("backend");
    try {
      const response = await fetch("/api/explorer/tree", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo cargar el Explorador.");
      setAreas(await response.json());
    } catch (cause) {
      setAreas(demoTree());
      setSource("demo");
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el Explorador.");
    } finally {
      setLoading(false);
    }
  }

  const located = locate(areas, selection);
  const currentEntity = located.module ?? located.project ?? located.area;
  const deleteMessage = getDeleteMessage(selection, located);

  function select(next: NonNullable<ExplorerSelection>) {
    setSelection(next);
    router.replace(`/explorer?type=${next.type}&id=${next.id}`, { scroll: false });
  }

  function root() {
    setSelection(null);
    router.replace("/explorer", { scroll: false });
  }

  function removeCurrent() {
    if (!selection) return;

    startTransition(async () => {
      try {
        if (selection.type === "area") await deleteArea(selection.id);
        else if (selection.type === "project") await deleteProject(selection.id);
        else await deleteModule(selection.id);

        setDeleteOpen(false);
        root();
        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar.");
      }
    });
  }

  function saved(type: ExplorerNodeType, id: string) {
    load().then(() => select({ type, id }));
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-slate-200 px-4 text-sm">
        <button className="text-slate-500 hover:text-slate-950" onClick={root}>Escritorio</button>
        {located.area ? <Crumb label={located.area.name} onClick={() => select({ type: "area", id: located.area!.id })} /> : null}
        {located.project ? <Crumb label={located.project.name} onClick={() => select({ type: "project", id: located.project!.id })} /> : null}
        {located.module ? <Crumb label={located.module.name} onClick={() => select({ type: "module", id: located.module!.id })} /> : null}
        <Badge variant="outline" className={`ml-auto ${source === "backend" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : source === "demo" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {source === "backend" ? "Backend real" : source === "demo" ? "Demo" : "Error"}
        </Badge>
      </div>

      <div className="grid min-h-[calc(100vh-10rem)] md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50/60 p-3 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <FolderTree className="size-4" />
              <h2 className="text-sm font-semibold">Explorador</h2>
            </div>
            <Button size="icon" variant="ghost" aria-label="Crear área" onClick={() => setForm({ kind: "area" })}>
              <Plus className="size-4" />
            </Button>
          </div>
          {loading ? <p className="px-2 py-8 text-center text-sm text-slate-400">Cargando estructura…</p> : <ExplorerTree areas={areas} selection={selection} onSelect={select} />}
        </aside>

        <main>
          {error ? (
            <div className="m-5 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={load}>
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
            </div>
          ) : null}

          {!selection && !loading ? (
            <div className="grid min-h-96 place-items-center p-8 text-center">
              <div>
                <FolderTree className="mx-auto size-12 text-slate-300" />
                <h1 className="mt-4 text-xl font-semibold">Explorador de Nexo</h1>
                <p className="mt-2 text-sm text-slate-500">Seleccioná un nodo del árbol o creá una nueva área.</p>
                <Button className="mt-5" onClick={() => setForm({ kind: "area" })}>
                  <Plus className="size-4" />
                  Crear área
                </Button>
              </div>
            </div>
          ) : (
            <ExplorerDetail
              area={located.area}
              project={located.project}
              module={located.module}
              onSelect={select}
              onCreate={(kind) => setForm({ kind, areaId: located.area?.id, projectId: located.project?.id })}
              onEdit={() => currentEntity && setForm({ kind: selection!.type, entity: currentEntity, areaId: located.area?.id, projectId: located.project?.id })}
              onDelete={() => setDeleteOpen(true)}
            />
          )}
        </main>
      </div>

      {form ? <ExplorerFormDialog key={`${form.kind}-${form.entity?.id ?? "new"}`} kind={form.kind} open onOpenChange={(open) => !open && setForm(null)} entity={form.entity} areaId={form.areaId} projectId={form.projectId} onSaved={saved} /> : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>{deleteMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={removeCurrent} className="bg-red-600 text-white hover:bg-red-700">
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function getDeleteMessage(selection: ExplorerSelection, located: { area?: ExplorerArea; project?: ExplorerProject; module?: ExplorerModule }) {
  if (selection?.type === "area") {
    return `Vas a eliminar el área “${located.area?.name ?? "seleccionada"}”. También se eliminarán sus proyectos, módulos y registros dependientes. Las tareas, ideas y activos que puedan conservarse quedarán sin vínculo de área/proyecto.`;
  }
  if (selection?.type === "project") {
    return `Vas a eliminar el proyecto “${located.project?.name ?? "seleccionado"}”. También se eliminarán sus módulos y registros dependientes. Las tareas, ideas y activos que puedan conservarse quedarán sin vínculo de proyecto.`;
  }
  if (selection?.type === "module") {
    return `Vas a eliminar el módulo “${located.module?.name ?? "seleccionado"}”. También se eliminarán sus registros dependientes.`;
  }
  return "Seleccioná un elemento para eliminar.";
}

function Crumb({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <>
      <ChevronRight className="size-3.5 text-slate-300" />
      <button className="max-w-48 truncate font-medium text-slate-700 hover:text-slate-950" onClick={onClick}>{label}</button>
    </>
  );
}
