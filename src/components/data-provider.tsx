"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initialData } from "@/lib/demo-data";

type Data = typeof initialData;
export type DataSource = "loading" | "backend" | "demo" | "local-storage" | "error";
type Ctx = {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  dataSource: DataSource;
  dataError: string | null;
  reset: () => void;
};

const emptyData: Data = {
  ...initialData,
  areas: [],
  projects: [],
  tasks: [],
  assets: [],
  ideas: [],
  dues: [],
  reviews: [],
  focus: {
    mainProjectId: "",
    secondaryProjectIds: [],
    avoidProjectIds: [],
    weeklyGoal: "",
    notes: "",
  },
};

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(emptyData);
  const [dataSource, setDataSource] = useState<DataSource>("loading");
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const demoMode = new URLSearchParams(window.location.search).get("data") === "demo";

    if (demoMode) {
      try {
        const saved = localStorage.getItem("nexo-data");
        if (saved) {
          Promise.resolve().then(() => {
            setData(JSON.parse(saved));
            setDataSource("local-storage");
            console.info("[Nexo] Fuente de datos activa: localStorage demo");
          });
          return;
        }
      } catch (error) {
        console.warn("[Nexo] No se pudo leer localStorage demo", error);
      }

      Promise.resolve().then(() => {
        setData(initialData);
        setDataSource("demo");
        console.info("[Nexo] Fuente de datos activa: demo");
      });
      return;
    }

    const resources = ["areas", "projects", "tasks", "assets", "ideas"] as const;

    Promise.all(
      resources.map((resource) =>
        fetch(`/api/${resource}`, { cache: "no-store" }).then((response) => {
          if (!response.ok) throw new Error(`API no disponible: ${resource} (${response.status})`);
          return response.json();
        }),
      ),
    )
      .then(([areas, projects, tasks, assets, ideas]) => {
        setData({
          ...emptyData,
          areas,
          projects,
          tasks,
          assets,
          ideas,
        });
        setDataSource("backend");
        setDataError(null);
        console.info("[Nexo] Fuente de datos activa: backend real");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Error de backend";
        setData(emptyData);
        setDataSource("error");
        setDataError(message);
        console.error("[Nexo] Backend real falló. No se aplica fallback silencioso.", error);
      });
  }, []);

  useEffect(() => {
    if (["demo", "local-storage"].includes(dataSource)) {
      localStorage.setItem("nexo-data", JSON.stringify(data));
    }
  }, [data, dataSource]);

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        dataSource,
        dataError,
        reset: () => setData(dataSource === "demo" || dataSource === "local-storage" ? initialData : emptyData),
      }}
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
