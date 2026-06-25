"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderKanban, Box } from "lucide-react";
import type { ExplorerArea, ExplorerSelection } from "@/lib/explorer-types";

const stateDot: Record<string, string> = { active: "bg-emerald-500", blocked: "bg-red-500", paused: "bg-amber-500", completed: "bg-blue-500", planned: "bg-slate-400", idea: "bg-violet-400" };

export function ExplorerTree({ areas, selection, onSelect }: { areas: ExplorerArea[]; selection: ExplorerSelection; onSelect: (selection: NonNullable<ExplorerSelection>) => void }) {
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const visibleAreas = new Set(expandedAreas); const visibleProjects = new Set(expandedProjects);
  if (selection) for (const area of areas) for (const project of area.projects) {
    if (!collapsedAreas.has(area.id) && (selection.id === area.id || selection.id === project.id || project.modules.some((item) => item.id === selection.id))) visibleAreas.add(area.id);
    if (!collapsedProjects.has(project.id) && (selection.id === project.id || project.modules.some((item) => item.id === selection.id))) visibleProjects.add(project.id);
  }
  const toggle = (id: string, visible: Set<string>, setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>, setCollapsed: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setExpanded((current) => { const next = new Set(current); if (visible.has(id)) next.delete(id); else next.add(id); return next; });
    setCollapsed((current) => { const next = new Set(current); if (visible.has(id)) next.add(id); else next.delete(id); return next; });
  };
  const row = (active: boolean) => `flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

  return <div className="space-y-1" aria-label="Árbol del Explorador">
    {areas.map((area) => <div key={area.id}>
      <div className="flex items-center">
        <button aria-label={`${visibleAreas.has(area.id) ? "Contraer" : "Expandir"} ${area.name}`} className="grid size-8 shrink-0 place-items-center text-slate-400" onClick={() => toggle(area.id, visibleAreas, setExpandedAreas, setCollapsedAreas)}>{visibleAreas.has(area.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button>
        <button className={row(selection?.type === "area" && selection.id === area.id)} onClick={() => onSelect({ type: "area", id: area.id })}><Folder className="size-4" style={{ color: area.color ?? undefined }} /><span className="min-w-0 flex-1 truncate font-medium">{area.name}</span><span className={`size-1.5 rounded-full ${stateDot[area.status] ?? "bg-slate-400"}`} /></button>
      </div>
      {visibleAreas.has(area.id) && <div className="ml-5 border-l border-slate-200 pl-2">
        {area.projects.map((project) => <div key={project.id}>
          <div className="flex items-center">
            <button aria-label={`${visibleProjects.has(project.id) ? "Contraer" : "Expandir"} ${project.name}`} className="grid size-8 shrink-0 place-items-center text-slate-400" onClick={() => toggle(project.id, visibleProjects, setExpandedProjects, setCollapsedProjects)}>{visibleProjects.has(project.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button>
            <button className={row(selection?.type === "project" && selection.id === project.id)} onClick={() => onSelect({ type: "project", id: project.id })}><FolderKanban className="size-4" /><span className="min-w-0 flex-1 truncate">{project.name}</span><span className={`size-1.5 rounded-full ${stateDot[project.status] ?? "bg-slate-400"}`} /></button>
          </div>
          {visibleProjects.has(project.id) && <div className="ml-7 space-y-0.5 border-l border-slate-200 pl-2">{project.modules.map((item) => <button key={item.id} className={row(selection?.type === "module" && selection.id === item.id)} onClick={() => onSelect({ type: "module", id: item.id })}><Box className="size-3.5" /><span className="min-w-0 flex-1 truncate">{item.name}</span><span className={`size-1.5 rounded-full ${stateDot[item.status] ?? "bg-slate-400"}`} /></button>)}</div>}
        </div>)}
      </div>}
    </div>)}
  </div>;
}
