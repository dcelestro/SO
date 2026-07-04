"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Circle,
  Diamond,
  Expand,
  Minus,
  MousePointer2,
  Square,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoardCanvas, type BoardMode } from "@/components/boards/board-canvas";
import type {
  BoardData,
  BoardEdgeType,
  BoardShape,
  VisualBoard,
} from "@/lib/board-types";

export function BoardEditor({ id }: { id: string }) {
  const router = useRouter();
  const [board, setBoard] = useState<VisualBoard | null>(null);
  const [data, setData] = useState<BoardData | null>(null);
  const [mode, setMode] = useState<BoardMode>("select");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [edgeType, setEdgeType] = useState<BoardEdgeType>("arrow");
  const [fullscreen, setFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/boards/${id}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((value) => {
        if (active) {
          setBoard(value);
          setData(value.data);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  const save = useCallback(async () => {
    if (!board || !data) return;
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/boards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: board.title,
        description: board.description,
        data,
      }),
    });
    const body = await response.json();
    if (response.ok) {
      setBoard(body);
      setMessage("Guardado");
    } else {
      setMessage(body.error ?? "No se pudo guardar");
    }
    setSaving(false);
  }, [board, data, id]);

  useEffect(() => {
    if (!board || fullscreen) return;
    window.dispatchEvent(
      new CustomEvent("nexo:board-header-action", {
        detail: {
          label: "Guardar",
          title: board.title,
          saving,
          message,
          onSave: save,
          onTitleChange: (title: string) => setBoard({ ...board, title }),
        },
      }),
    );
    return () => {
      window.dispatchEvent(new CustomEvent("nexo:clear-board-header-action"));
    };
  }, [board, fullscreen, message, save, saving]);

  if (!board || !data) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-sm text-slate-500">
        Cargando pizarra...
      </div>
    );
  }

  function addNode(shape: BoardShape, type: "shape" | "text" = "shape") {
    const currentData = data;
    if (!currentData) return;
    const presets: Record<
      BoardShape,
      { width: number; height: number; text: string; color: string }
    > = {
      rectangle: {
        width: 220,
        height: 100,
        text: "Nueva caja",
        color: "#ffffff",
      },
      rounded_rectangle: {
        width: 220,
        height: 100,
        text: "Bloque",
        color: "#eefdf3",
      },
      ellipse: { width: 170, height: 110, text: "Inicio", color: "#eff6ff" },
      diamond: {
        width: 150,
        height: 150,
        text: "Decisión",
        color: "#fef3c7",
      },
      sticky: { width: 190, height: 140, text: "Nota", color: "#fef08a" },
    };
    const base = presets[shape];
    const node = {
      id: crypto.randomUUID(),
      type,
      x: 80 + currentData.nodes.length * 24,
      y: 80 + currentData.nodes.length * 24,
      width: type === "text" ? 180 : base.width,
      height: type === "text" ? 54 : base.height,
      text: type === "text" ? "Texto simple" : base.text,
      color: type === "text" ? "#ffffff" : base.color,
      shape,
    };
    setData({ ...currentData, nodes: [...currentData.nodes, node] });
    setSelectedNodeId(node.id);
    setMode("select");
  }

  function connect(nodeId: string) {
    const currentData = data;
    if (!currentData) return;
    if (!connectFrom) {
      setConnectFrom(nodeId);
      return;
    }
    if (connectFrom === nodeId) {
      setConnectFrom(null);
      return;
    }
    setData({
      ...currentData,
      edges: [
        ...currentData.edges,
        {
          id: crypto.randomUUID(),
          fromNodeId: connectFrom,
          toNodeId: nodeId,
          type: edgeType,
        },
      ],
    });
    setConnectFrom(null);
    setMode("select");
  }

  function removeSelected() {
    if (!selectedNodeId) return;
    const currentData = data;
    if (!currentData) return;
    setData({
      ...currentData,
      nodes: currentData.nodes.filter((node) => node.id !== selectedNodeId),
      edges: currentData.edges.filter(
        (edge) =>
          edge.fromNodeId !== selectedNodeId &&
          edge.toNodeId !== selectedNodeId,
      ),
    });
    setSelectedNodeId(null);
  }

  const selected = data.nodes.find((node) => node.id === selectedNodeId);
  const content = (
    <div
      className={
        fullscreen ? "flex h-full flex-col overflow-hidden bg-white" : ""
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Tool
            active={mode === "select"}
            onClick={() => {
              setMode("select");
              setConnectFrom(null);
            }}
            icon={<MousePointer2 className="size-4" />}
            label="Seleccionar"
          />
          <Tool
            active={false}
            onClick={() => addNode("rectangle")}
            icon={<Square className="size-4" />}
            label="Rectángulo"
          />
          <Tool
            active={false}
            onClick={() => addNode("rounded_rectangle")}
            icon={<Square className="size-4" />}
            label="Redondeado"
          />
          <Tool
            active={false}
            onClick={() => addNode("ellipse")}
            icon={<Circle className="size-4" />}
            label="Círculo"
          />
          <Tool
            active={false}
            onClick={() => addNode("diamond")}
            icon={<Diamond className="size-4" />}
            label="Rombo"
          />
          <Tool
            active={false}
            onClick={() => addNode("sticky")}
            icon={<StickyNote className="size-4" />}
            label="Nota"
          />
          <Tool
            active={false}
            onClick={() => addNode("rectangle", "text")}
            icon={<Type className="size-4" />}
            label="Texto"
          />
          <Tool
            active={mode === "connect" && edgeType === "arrow"}
            onClick={() => {
              setMode("connect");
              setEdgeType("arrow");
              setConnectFrom(null);
            }}
            icon={<ArrowRight className="size-4" />}
            label="Flecha"
          />
          <Tool
            active={mode === "connect" && edgeType === "line"}
            onClick={() => {
              setMode("connect");
              setEdgeType("line");
              setConnectFrom(null);
            }}
            icon={<Minus className="size-4" />}
            label="Línea"
          />
          <Tool
            active={mode === "delete"}
            onClick={() => setMode("delete")}
            icon={<Trash2 className="size-4" />}
            label="Eliminar"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFullscreen((value) => !value)}
            aria-label="Pantalla completa"
          >
            <Expand className="size-4" />
          </Button>
          {fullscreen ? (
            <Button onClick={save} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          ) : null}
          {selected ? (
            <>
              <input
                aria-label="Color del nodo"
                type="color"
                value={selected.color}
                onChange={(event) =>
                  setData({
                    ...data,
                    nodes: data.nodes.map((node) =>
                      node.id === selected.id
                        ? { ...node, color: event.target.value }
                        : node,
                    ),
                  })
                }
                className="size-9 rounded border p-1"
              />
              <Button variant="outline" size="sm" onClick={removeSelected}>
                <Trash2 className="size-4" />
                Nodo
              </Button>
            </>
          ) : null}
        </div>
        <div className="overflow-auto">
          <BoardCanvas
            data={data}
            onChange={setData}
            mode={mode}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            connectFrom={connectFrom}
            onConnect={connect}
            fullscreen={fullscreen}
          />
        </div>
      </div>
    </div>
  );

  return fullscreen ? (
    <div className="fixed inset-2 z-50 bg-white shadow-2xl">{content}</div>
  ) : (
    content
  );
}

function Tool({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}
