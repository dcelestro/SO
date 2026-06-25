"use client";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Circle,
  Diamond,
  Maximize2,
  Minus,
  Plus,
  Save,
  Square,
  StickyNote,
  Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BoardData, BoardEdgeType, BoardNode, BoardShape, VisualBoard } from "@/lib/board-types";

type Tool =
  | { kind: "node"; shape: BoardShape; label: string }
  | { kind: "text"; label: string }
  | { kind: "edge"; edgeType: BoardEdgeType; label: string };

const tools: Tool[] = [
  { kind: "node", shape: "rectangle", label: "Rectángulo" },
  { kind: "node", shape: "rounded_rectangle", label: "Redondeado" },
  { kind: "node", shape: "ellipse", label: "Círculo" },
  { kind: "node", shape: "diamond", label: "Rombo" },
  { kind: "node", shape: "sticky", label: "Nota" },
  { kind: "text", label: "Texto" },
  { kind: "edge", edgeType: "arrow", label: "Flecha" },
  { kind: "edge", edgeType: "line", label: "Línea" },
];

const icons: Record<string, React.ReactNode> = {
  rectangle: <Square className="size-4" />,
  rounded_rectangle: <Square className="size-4" />,
  ellipse: <Circle className="size-4" />,
  diamond: <Diamond className="size-4" />,
  sticky: <StickyNote className="size-4" />,
  text: <Type className="size-4" />,
  arrow: <ArrowRight className="size-4" />,
  line: <Minus className="size-4" />,
};

const defaults: Record<BoardShape, Pick<BoardNode, "width" | "height" | "text" | "color">> = {
  rectangle: { width: 180, height: 86, text: "Paso", color: "#dbeafe" },
  rounded_rectangle: { width: 190, height: 86, text: "Bloque", color: "#dcfce7" },
  ellipse: { width: 150, height: 96, text: "Inicio", color: "#fee2e2" },
  diamond: { width: 150, height: 120, text: "Decisión", color: "#fef3c7" },
  sticky: { width: 180, height: 130, text: "Nota", color: "#fef08a" },
};

function cloneData(data: BoardData): BoardData {
  return {
    nodes: data.nodes.map((node) => ({ ...node, type: node.type === "box" ? "shape" : node.type })),
    edges: data.edges.map((edge) => ({ ...edge })),
    viewport: { ...data.viewport },
  };
}

function nodeCenter(node: BoardNode) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function shapeClasses(node: BoardNode, selected: boolean) {
  const base = "absolute grid place-items-center border px-3 text-center text-sm font-medium shadow-sm transition";
  const ring = selected ? " ring-2 ring-slate-950 ring-offset-2" : "";
  if (node.type === "text") return `${base} border-transparent bg-transparent shadow-none${ring}`;
  if (node.shape === "ellipse") return `${base} rounded-full border-slate-300${ring}`;
  if (node.shape === "diamond") return `${base} rotate-45 border-slate-300${ring}`;
  if (node.shape === "sticky") return `${base} items-start rounded-sm border-amber-200 text-left shadow-md${ring}`;
  if (node.shape === "rounded_rectangle") return `${base} rounded-xl border-slate-300${ring}`;
  return `${base} rounded-sm border-slate-300${ring}`;
}

export function BoardCanvasEditor({
  board,
  onSaved,
}: {
  board: VisualBoard;
  onSaved: (board: VisualBoard) => void;
}) {
  const [data, setData] = useState<BoardData>(() => cloneData(board.data));
  const [tool, setTool] = useState<Tool>(tools[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pendingEdgeNodeId, setPendingEdgeNodeId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedNode = useMemo(
    () => data.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [data.nodes, selectedNodeId],
  );

  function addNode(shape: BoardShape | "text") {
    const index = data.nodes.length;
    const nodeShape: BoardShape = shape === "text" ? "rectangle" : shape;
    const preset = shape === "text" ? { width: 180, height: 48, text: "Texto", color: "#ffffff" } : defaults[nodeShape];
    const node: BoardNode = {
      id: crypto.randomUUID(),
      type: shape === "text" ? "text" : "shape",
      shape: nodeShape,
      x: 80 + (index % 4) * 56,
      y: 80 + (index % 5) * 38,
      ...preset,
    };
    setData((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedNodeId(node.id);
  }

  function chooseTool(nextTool: Tool) {
    setTool(nextTool);
    setPendingEdgeNodeId(null);
    if (nextTool.kind === "node") addNode(nextTool.shape);
    if (nextTool.kind === "text") addNode("text");
  }

  function selectNode(node: BoardNode) {
    if (tool.kind === "edge") {
      if (!pendingEdgeNodeId) {
        setPendingEdgeNodeId(node.id);
        setSelectedNodeId(node.id);
        return;
      }
      if (pendingEdgeNodeId !== node.id) {
        const edge = {
          id: crypto.randomUUID(),
          fromNodeId: pendingEdgeNodeId,
          toNodeId: node.id,
          type: tool.edgeType,
        };
        setData((current) => ({ ...current, edges: [...current.edges, edge] }));
      }
      setPendingEdgeNodeId(null);
    }
    setSelectedNodeId(node.id);
  }

  function updateSelected(patch: Partial<BoardNode>) {
    if (!selectedNodeId) return;
    setData((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (node.id === selectedNodeId ? { ...node, ...patch } : node)),
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No se pudo guardar la pizarra.");
      onSaved(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la pizarra.");
    } finally {
      setSaving(false);
    }
  }

  const canvas = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <Button size="sm" variant="outline" onClick={() => addNode(tool.kind === "node" ? tool.shape : "rectangle")}>
          <Plus className="size-4" />
          Nuevo
        </Button>
        <Button size="sm" onClick={save} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <div className="h-6 w-px bg-slate-200" />
        {tools.map((item) => {
          const key = item.kind === "node" ? item.shape : item.kind === "edge" ? item.edgeType : "text";
          const active =
            item.kind === tool.kind &&
            (item.kind === "node" ? tool.kind === "node" && item.shape === tool.shape : item.kind === "edge" ? tool.kind === "edge" && item.edgeType === tool.edgeType : true);
          return (
            <Button key={key} size="icon" variant={active ? "default" : "ghost"} title={item.label} aria-label={item.label} onClick={() => chooseTool(item)}>
              {icons[key]}
            </Button>
          );
        })}
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-xs font-semibold text-slate-800">{board.title}</p>
            <p className="max-w-80 truncate text-[11px] text-slate-500">{board.description || "Sin descripción"}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setFullscreen((value) => !value)} aria-label="Pantalla completa">
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>
      {error && <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative min-h-[520px] overflow-auto bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="relative h-[1100px] w-[1500px]">
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <marker id="board-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                  <path d="M0,0 L8,4 L0,8 z" fill="#334155" />
                </marker>
              </defs>
              {data.edges.map((edge) => {
                const from = data.nodes.find((node) => node.id === edge.fromNodeId);
                const to = data.nodes.find((node) => node.id === edge.toNodeId);
                if (!from || !to) return null;
                const start = nodeCenter(from);
                const end = nodeCenter(to);
                return (
                  <line
                    key={edge.id}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#334155"
                    strokeWidth="2"
                    markerEnd={edge.type === "arrow" ? "url(#board-arrow)" : undefined}
                  />
                );
              })}
            </svg>
            {data.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={shapeClasses(node, selectedNodeId === node.id || pendingEdgeNodeId === node.id)}
                style={{ left: node.x, top: node.y, width: node.width, height: node.height, backgroundColor: node.color }}
                onClick={() => selectNode(node)}
              >
                <span className={node.shape === "diamond" ? "block -rotate-45" : "block"}>{node.text}</span>
              </button>
            ))}
          </div>
        </div>
        <aside className="border-t border-slate-200 bg-white p-3 md:border-l md:border-t-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Propiedades</h3>
            <Badge variant="outline" className="text-[10px]">{data.nodes.length} nodos</Badge>
          </div>
          {selectedNode ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-500">
                Texto
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400"
                  value={selectedNode.text}
                  onChange={(event) => updateSelected({ text: event.target.value })}
                />
              </label>
              <label className="block text-xs font-medium text-slate-500">
                Color
                <input
                  className="mt-1 h-9 w-full rounded-md border border-slate-200"
                  type="color"
                  value={selectedNode.color}
                  onChange={(event) => updateSelected({ color: event.target.value })}
                />
              </label>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">Seleccioná una forma para editar su texto o color. Para conectar, elegí flecha o línea y tocá dos formas.</p>
          )}
        </aside>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-3 z-50 flex flex-col rounded-lg bg-white shadow-2xl">
        {canvas}
      </div>
    );
  }
  return canvas;
}
