import { useState, useEffect, useCallback } from "react";

export type ShortcutType = "system" | "area" | "project" | "module" | "resource" | "inbox" | "alerts" | "custom";

export interface DesktopShortcut {
  id: string;
  name: string;
  description?: string;
  type: ShortcutType;
  icon?: string;
  color?: string;
  targetType?: string;
  targetId?: string;
  sortOrder: number;
  isPinned: boolean;
  lastOpenedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useDesktopShortcuts() {
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load shortcuts from API
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/desktop-shortcuts");
        if (!response.ok) throw new Error("No se pudieron cargar los accesos");
        const data = await response.json();
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || a.sortOrder - b.sortOrder
        );
        setShortcuts(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const create = useCallback(
    async (data: Omit<DesktopShortcut, "id" | "createdAt" | "updatedAt">) => {
      try {
        const response = await fetch("/api/desktop-shortcuts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("No se pudo crear el acceso");
        const newShortcut = await response.json();
        setShortcuts((prev) => {
          const updated = [...prev, newShortcut];
          return updated.sort(
            (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || a.sortOrder - b.sortOrder
          );
        });
        return newShortcut;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Error desconocido");
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<DesktopShortcut, "id" | "createdAt" | "updatedAt">>) => {
      try {
        const response = await fetch(`/api/desktop-shortcuts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("No se pudo actualizar el acceso");
        const updated = await response.json();
        setShortcuts((prev) => {
          const list = prev.map((s) => (s.id === id ? updated : s));
          return list.sort(
            (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || a.sortOrder - b.sortOrder
          );
        });
        return updated;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Error desconocido");
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/desktop-shortcuts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar el acceso");
      setShortcuts((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Error desconocido");
    }
  }, []);

  return { shortcuts, loading, error, create, update, remove };
}
