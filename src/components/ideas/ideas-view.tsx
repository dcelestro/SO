"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lightbulb, Search } from "lucide-react";
import { IdeaActionMenu } from "@/components/ideas/idea-action-menu";
import { Header, fmt, labels, Status } from "@/components/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  all: "Todos los estados",
  inbox: "Inbox",
  archived: "Archivadas",
  promoted: "Promovidas",
};

export function IdeasView({
  ideas,
  projects,
  areas,
}: {
  ideas: any[];
  projects: any[];
  areas: any[];
}) {
  const [rows, setRows] = useState(ideas);
  const [projectRows, setProjectRows] = useState(projects);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    setRows(ideas);
  }, [ideas]);

  useEffect(() => {
    setProjectRows(projects);
  }, [projects]);

  function mergeIdea(updatedIdea: any) {
    setRows((current) =>
      current.map((idea) =>
        idea.id === updatedIdea.id
          ? {
              ...idea,
              ...updatedIdea,
              area: updatedIdea.area ?? idea.area,
              project: updatedIdea.project ?? idea.project,
            }
          : idea,
      ),
    );
  }

  function removeIdea(ideaId: string) {
    setRows((current) => current.filter((idea) => idea.id !== ideaId));
  }

  function promoteIdea(payload: { idea: any; project: any }) {
    mergeIdea(payload.idea);
    setProjectRows((current) => [payload.project, ...current]);
  }

  const filtered = rows.filter((idea) => {
    const haystack = [
      idea.title,
      idea.description,
      idea.destination,
      idea.notes,
      idea.area?.name,
      idea.project?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      haystack.includes(search.toLowerCase()) &&
      (status === "all" || idea.status === status)
    );
  });

  return (
    <>
      <Header
        title="Incubadora de ideas"
        desc="Capturar no significa comprometerse. Evaluá antes de abrir otro frente."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Buscar idea, área, proyecto o nota..."
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((idea) => (
          <Card
            key={idea.id}
            className={`shadow-none ${idea.status === "promoted" ? "border-emerald-200 bg-emerald-50/30" : idea.status === "archived" ? "border-slate-200 bg-slate-50/60" : "border-blue-100 bg-white"}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-slate-100">
                  <Lightbulb className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Status value={idea.status} />
                  <IdeaActionMenu
                    idea={idea}
                    projects={projectRows}
                    areas={areas}
                    onUpdated={mergeIdea}
                    onDeleted={removeIdea}
                    onPromoted={promoteIdea}
                  />
                </div>
              </div>
              <CardTitle className="pt-2 text-base font-semibold text-slate-800">
                {idea.title}
              </CardTitle>
              <CardDescription>{idea.description || "Sin descripción"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p>
                  Potencial <b>{labels[idea.potential] || idea.potential || "-"}</b>
                  <span className="mx-2">·</span>
                  Complejidad <b>{labels[idea.complexity] || idea.complexity || "-"}</b>
                </p>
                <p className="mt-2">
                  {idea.area?.name || "Sin área"}
                  <span className="mx-2">·</span>
                  {idea.project ? (
                    <Link href={`/projects/${idea.projectId}`} className="font-medium text-blue-700 hover:underline">
                      {idea.project.name}
                    </Link>
                  ) : (
                    "Sin proyecto"
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Revisar {fmt(idea.reviewDate)}</span>
                <span>{idea.origin ? labels[idea.origin] || idea.origin : "Personal"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filtered.length ? (
        <div className="mt-4 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          No hay ideas para este filtro.
        </div>
      ) : null}
    </>
  );
}
