"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  CheckSquare2,
  FolderKanban,
  FolderTree,
  Home,
  Library,
  Lightbulb,
  Menu,
  Network,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Snowflake,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuickCreate } from "./quick-create";
import { Spotlight } from "./spotlight";
import { InboxCapture } from "./inbox/inbox-capture";
import { DataProvider } from "@/components/data-provider";
import { useAppData as useData } from "@/components/use-app-data";

type NavItemConfig = { href: string; label: string; Icon: LucideIcon };
type NavGroup = { label: string; items: NavItemConfig[] };
type HeaderBoardAction = {
  label: string;
  title: string;
  saving: boolean;
  message: string;
  onSave: () => void;
  onTitleChange: (title: string) => void;
};

const groups: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { href: "/dashboard", label: "Inicio", Icon: Home },
      { href: "/explorer", label: "Explorador", Icon: FolderTree },
      { href: "/tasks", label: "Tareas", Icon: CheckSquare2 },
      { href: "/foco", label: "Foco semanal", Icon: Target },
    ],
  },
  {
    label: "Proyectos",
    items: [
      { href: "/projects", label: "Proyectos", Icon: FolderKanban },
      { href: "/ecosystem", label: "Ecosistema", Icon: Boxes },
      { href: "/freezer", label: "Congelador", Icon: Snowflake },
    ],
  },
  {
    label: "Recursos",
    items: [
      { href: "/library", label: "Biblioteca", Icon: Library },
      { href: "/assets", label: "Activos", Icon: ShieldCheck },
      { href: "/boards", label: "Pizarras y diagramas", Icon: Network },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/ideas", label: "Ideas", Icon: Lightbulb },
      { href: "/kpis", label: "KPIs", Icon: BarChart3 },
    ],
  },
  {
    label: "Extras",
    items: [
      { href: "/alerts", label: "Alertas", Icon: Bell },
      { href: "/settings", label: "Configuración", Icon: Settings },
    ],
  },
];

function Nav({ close }: { close?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 px-3 py-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-400">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map(({ href, label, Icon }) => (
              <Link
                key={`${href}-${label}`}
                onClick={close}
                href={href}
                className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [create, setCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [boardAction, setBoardAction] = useState<HeaderBoardAction | null>(null);
  const { dataSource, dataError } = useData();
  const sourceLabel =
    dataSource === "backend"
      ? "Backend real"
      : dataSource === "local-storage"
        ? "Demo/localStorage"
        : dataSource === "demo"
          ? "Demo"
          : dataSource === "error"
            ? "Backend con error"
            : "Validando backend";

  useEffect(() => {
    const onRegister = (event: Event) => setBoardAction((event as CustomEvent<HeaderBoardAction>).detail);
    const onClear = () => setBoardAction(null);
    const onOpenQuickCreate = () => setCreate(true);
    window.addEventListener("nexo:board-header-action", onRegister);
    window.addEventListener("nexo:clear-board-header-action", onClear);
    window.addEventListener("nexo:open-quick-create", onOpenQuickCreate);
    return () => {
      window.removeEventListener("nexo:board-header-action", onRegister);
      window.removeEventListener("nexo:clear-board-header-action", onClear);
      window.removeEventListener("nexo:open-quick-create", onOpenQuickCreate);
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-max min-w-max max-w-[calc(100vw-1rem)] p-0 data-[side=left]:w-max data-[side=left]:sm:max-w-none">
              <SheetTitle className="sr-only">Menú principal</SheetTitle>
              <div className="flex h-full min-w-[18rem] flex-col border-r bg-white">
                <Nav close={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Spotlight />
          <div className="ml-auto flex items-center gap-2">
            {boardAction ? (
              <div className="flex items-center gap-2">
                <Input
                  value={boardAction.title}
                  onChange={(event) => boardAction.onTitleChange(event.target.value)}
                  className="hidden h-9 w-56 md:block"
                  aria-label="Título de la pizarra"
                />
                {boardAction.message ? (
                  <span className="hidden text-xs text-slate-500 md:inline">{boardAction.message}</span>
                ) : null}
                <Button size="sm" variant="outline" disabled={boardAction.saving} onClick={boardAction.onSave}>
                  <Save className="size-4" />
                  {boardAction.saving ? "Guardando..." : boardAction.label}
                </Button>
              </div>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={() => setCreate(true)}>
                  <Plus /> Nuevo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Crear rápido</TooltipContent>
            </Tooltip>
            <div className="grid size-9 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
              DA
            </div>
          </div>
        </header>
        <div className="border-b border-emerald-200 bg-emerald-50 px-7 py-2 text-xs text-emerald-700">
          Fuente de datos: {sourceLabel}{dataError ? ` · ${dataError}` : ""}
        </div>
        <div className="mx-auto max-w-7xl px-4 py-7 md:px-7">{children}</div>
        <QuickCreate open={create} onOpenChange={setCreate} />
        <InboxCapture />
      </div>
    </TooltipProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}
