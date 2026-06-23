"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { initialData } from "@/lib/demo-data";
type Data = typeof initialData;
type Ctx = {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  reset: () => void;
};
const DataContext = createContext<Ctx | null>(null);
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(initialData);
  useEffect(() => {
    const resources = ["areas", "projects", "tasks", "weekly-focus/current"];
    Promise.all(
      resources.map((r) =>
        fetch(`/api/${r}`).then((x) => {
          if (!x.ok) throw new Error("API no disponible");
          return x.json();
        }),
      ),
    )
      .then(([areas, projects, tasks, focus]) =>
        setData({
          areas,
          projects,
          tasks,
          assets: [],
          ideas: [],
          dues: [],
          reviews: [],
          focus: {
            mainProjectId: focus?.mainProjectId || "",
            secondaryProjectIds:
              focus?.secondaryProjects?.map(
                (x: { projectId: string }) => x.projectId,
              ) || [],
            avoidProjectIds:
              focus?.avoidProjects?.map(
                (x: { projectId: string }) => x.projectId,
              ) || [],
            weeklyGoal: focus?.weeklyGoal || "",
            notes: focus?.notes || "",
          },
        }),
      )
      .catch(() => {
        try {
          const saved = localStorage.getItem("nexo-data");
          if (saved) Promise.resolve().then(() => setData(JSON.parse(saved)));
        } catch {}
      });
  }, []);
  useEffect(() => {
    localStorage.setItem("nexo-data", JSON.stringify(data));
  }, [data]);
  return (
    <DataContext.Provider
      value={{ data, setData, reset: () => setData(initialData) }}
    >
      {children}
    </DataContext.Provider>
  );
}
export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData requiere DataProvider");
  return value;
}
