"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderKanban, LayoutGrid, List, Search } from "lucide-react";
import { useAppData as useData } from "@/components/use-app-data";
import { Header, labels, Status, fmt } from "@/components/workspace";
import { ProjectActionMenu } from "@/components/projects/project-action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SemanticBadge } from "@/components/visual-hierarchy";

export function ProjectsView({ projects }: { projects: any[] }) {
  const { data } = useData();
  const [projectRows, setProjectRows] = useState(projects);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("table");

  useEffect(() => {
    setProjectRows(projects);
  }, [projects]);

  const areas = data?.areas || [];

  function mergeProject(updatedProject: any) {
    setProjectRows((prev) =>
      prev.map((project) =>
        project.id === updatedProject.id
          ? {
              ...project,
              ...updatedProject,
              area: updatedProject.area ?? project.area,
              tasks: updatedProject.tasks ?? project.tasks,
            }
          : project,
      ),
    );
  }

  function removeProject(projectId: string) {
    setProjectRows((prev) => prev.filter((project) => project.id !== projectId));
  }

  const rows = projectRows.filter(
    (p) =>
      p.status !== "discarded" &&
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || p.status === status),
  );

  return (
    <>
      <Header title="Proyectos" desc="" />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Buscar proyecto..."
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {["idea", "analysis", "active", "blocked", "paused", "frozen", "completed"].map((s) => (
              <SelectItem key={s} value={s}>
                {labels[s] || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-md border p-1">
          <Button
            size="icon"
            variant={view === "table" ? "secondary" : "ghost"}
            onClick={() => setView("table")}
            aria-label="Ver proyectos como tabla"
          >
            <List />
          </Button>
          <Button
            size="icon"
            variant={view === "cards" ? "secondary" : "ghost"}
            onClick={() => setView("cards")}
            aria-label="Ver proyectos como tarjetas"
          >
            <LayoutGrid />
          </Button>
        </div>
      </div>
      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              areas={areas}
              onUpdated={mergeProject}
              onArchived={removeProject}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="min-w-64">Próxima acción</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const inFocus = [
                  data?.focus?.mainProjectId,
                  ...(data?.focus?.secondaryProjectIds || []),
                ].includes(p.id);
                const outOfFocusActive =
                  !inFocus &&
                  p.tasks?.some(
                    (t: any) => !["completed", "discarded"].includes(t.status),
                  );
                return (
                  <TableRow
                    key={p.id}
                    className={
                      p.status === "blocked"
                        ? "bg-red-50/60"
                        : p.status === "frozen"
                          ? "bg-slate-50 text-slate-500"
                          : p.status === "active" && !p.nextAction
                            ? "bg-orange-50/60"
                            : ""
                    }
                  >
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          className="font-semibold text-slate-950 hover:underline"
                          href={`/projects/${p.id}`}
                        >
                          {p.name}
                        </Link>
                        {inFocus && (
                          <SemanticBadge
                            value={
                              p.id === data.focus.mainProjectId
                                ? "focus"
                                : "secondary"
                            }
                            label={
                              p.id === data.focus.mainProjectId
                                ? "Foco principal"
                                : "Foco"
                            }
                          />
                        )}{" "}
                        {outOfFocusActive && (
                          <SemanticBadge value="avoid" label="Fuera de foco" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Actualizado {fmt(p.updatedAt?.toString?.() ?? p.updatedAt)}
                      </p>
                    </TableCell>
                    <TableCell>{p.area?.name || "Sin área"}</TableCell>
                    <TableCell>
                      <Status value={p.status} />
                    </TableCell>
                    <TableCell>
                      <Status value={p.priority} />
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Próxima acción
                      </p>
                      <p
                        className={`mt-1 font-medium ${p.status === "active" && !p.nextAction ? "text-orange-700" : "text-slate-800"}`}
                      >
                        {p.nextAction || "Definir una próxima acción concreta"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={p.progressPercentage || 0}
                          className="w-20"
                        />
                        <span className="text-xs">{p.progressPercentage || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProjectActionMenu
                        project={p}
                        areas={areas}
                        onUpdated={mergeProject}
                        onArchived={removeProject}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}

function ProjectCard({
  project: p,
  areas,
  onUpdated,
  onArchived,
}: {
  project: any;
  areas: any[];
  onUpdated: (project: any) => void;
  onArchived: (projectId: string) => void;
}) {
  const { data } = useData();
  const inFocus = [
    data?.focus?.mainProjectId,
    ...(data?.focus?.secondaryProjectIds || []),
  ].includes(p.id);
  const needsAction = p.status === "active" && !p.nextAction;
  return (
    <Card
      className={`h-full border-l-4 transition hover:-translate-y-0.5 hover:shadow-md ${p.status === "blocked" ? "border-l-red-500 bg-red-50/40" : needsAction ? "border-l-orange-500 bg-orange-50/40" : p.status === "frozen" ? "border-l-slate-400 bg-slate-50" : "border-l-blue-500"}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-slate-100">
            <FolderKanban className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            {inFocus && (
              <SemanticBadge
                value={p.id === data.focus.mainProjectId ? "focus" : "secondary"}
                label="Foco"
              />
            )}
            <Status value={p.status} />
            <ProjectActionMenu
              project={p}
              areas={areas}
              onUpdated={onUpdated}
              onArchived={onArchived}
            />
          </div>
        </div>
        <CardTitle className="pt-2 text-base">
          <Link href={`/projects/${p.id}`} className="hover:underline">
            {p.name}
          </Link>
        </CardTitle>
        <CardDescription>{p.area?.name || "Sin área"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`mb-4 min-h-16 rounded-lg p-3 ${needsAction ? "bg-orange-100/70" : "bg-slate-50"}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Próxima acción
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${needsAction ? "text-orange-800" : "text-slate-900"}`}
          >
            {p.nextAction || "Definir una próxima acción concreta"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={p.progressPercentage || 0} />
          <span className="text-xs">{p.progressPercentage || 0}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
