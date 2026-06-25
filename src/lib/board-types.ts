export type BoardType = "whiteboard" | "flowchart" | "architecture" | "process" | "mindmap" | "notes" | "other";
export type BoardStatus = "draft" | "active" | "archived";
export interface BoardNode { id: string; type: "box" | "text"; x: number; y: number; width: number; height: number; text: string; color: string; shape: "rectangle" }
export interface BoardEdge { id: string; fromNodeId: string; toNodeId: string; label?: string; type: "arrow" | "line" }
export interface BoardData { nodes: BoardNode[]; edges: BoardEdge[]; viewport: { x: number; y: number; zoom: number } }
export interface VisualBoard {
  id: string; title: string; description: string | null; areaId: string; projectId: string | null; moduleId: string | null;
  type: BoardType; data: BoardData; thumbnail: string | null; status: BoardStatus; createdAt: string; updatedAt: string;
  area: { id: string; name: string }; project: { id: string; name: string } | null; module: { id: string; name: string } | null;
}
export const emptyBoardData = (): BoardData => ({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
