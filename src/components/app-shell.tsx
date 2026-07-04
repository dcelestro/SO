"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Boxes,
  CheckSquare2,
  ChevronDown,
  FolderKanban,
  FolderTree,
  Home,
  Inbox,
  Library,
  Lightbulb,
  LayoutGrid,
  Menu,
  Network,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Snowflake,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { QuickCreate } from "./quick-create";
import { Spotlight } from "./spotlight";
import { InboxCapture } from "./inbox/inbox-capture";
import { DataProvider } from "@/components/data-provider";
import { useAppData as useData } from "@/components/use-app-data";
type NavItemConfig = {
  href: string;
  label: string;
  Icon: LucideIcon;
};
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
      { href: "/desktop", label: "Escritorio", Icon: LayoutGrid },
      { href: "/explorer", label: "Explorador", Icon: FolderTree },
      {
        href: "/tasks",
        label: "Tareas",
        Icon: CheckSquare2,
      },
      { href: "/focus", label: "Foco semanal", Icon: Target },
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
    label: "Biblioteca",
    items: [
      {
        href: "/library",
        label: "Biblioteca",
        Icon: Library,
      },
    ],
  },
  {
    label: "Recursos",
    items: [
      { href: "/assets", label: "Activos", Icon: ShieldCheck },
      { href: "/boards", label: "Pizarras y diagramas", Icon: Network },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/ideas", label: "Ideas", Icon: Lightbulb },
      { href: "/reviews", label: "Revisiones", Icon: Activity },
      { href: "/kpis", label: "KPIs", Icon: BarChart3 },
    ],
  },
  {
    label: "Extras",
    items: [
      { href: "/tasks?tab=inbox", label: "Inbox", Icon: Inbox },
      { href: "/alerts", label: "Alertas", Icon: Bell },
      { href: "/archive", label: "Archivo", Icon: Archive },
      { href: "/settings", label: "Configuración", Icon: Settings },
    ],
  },
];
function Nav({ close }: { close?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 px-3 py-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-400">
            {g.label}
          </p>
          <div className="space-y-1">
            {g.items.map(({ href, label, Icon }) => (
              <div key={`${href}-${label}`}>
                <Link
                  onClick={close}
                  href={href}
                  className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </div>
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
  const [boardAction, setBoardAction] = useState<HeaderBoardAction | null>(
    null,
  );
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
    const onRegister = (event: Event) => {
      const detail = (event as CustomEvent<HeaderBoardAction>).detail;
      setBoardAction(detail);
    };
    const onClear = () => setBoardAction(null);
    window.addEventListener("nexo:board-header-action", onRegister);
    window.addEventListener("nexo:clear-board-header-action", onClear);
    return () => {
      window.removeEventListener("nexo:board-header-action", onRegister);
      window.removeEventListener("nexo:clear-board-header-action", onClear);
    };
  }, []);
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
        <div>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-max min-w-max max-w-[calc(100vw-1rem)] p-0 data-[side=left]:w-max data-[side=left]:sm:max-w-none"
              >
                <SheetTitle className="sr-only">Navegación</SheetTitle>
                <div className="flex h-16 items-center gap-3 border-b px-5 pr-14">
                  <div className="grid size-8 place-items-center rounded-lg bg-slate-950 text-white">
                    N
                  </div>
                  <b>Nexo</b>
                </div>
                <Nav close={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex">
              <Search className="size-4" />
              Buscar en tu ecosistema{" "}
              <kbd className="ml-auto text-[11px]">⌘ K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {boardAction ? (
                <>
                  <Input
                    aria-label="Título de la pizarra"
                    value={boardAction.title}
                    onChange={(event) =>
                      boardAction.onTitleChange(event.target.value)
                    }
                    className="hidden h-9 w-[280px] border-slate-200 bg-white text-right text-sm font-semibold shadow-none lg:block"
                  />
                  {boardAction.message ? (
                    <span className="hidden text-xs text-slate-500 md:inline">
                      {boardAction.message}
                    </span>
                  ) : null}
                  <Button
                    onClick={boardAction.onSave}
                    disabled={boardAction.saving}
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    <Save className="size-4" />
                    <span className="hidden sm:inline">
                      {boardAction.saving ? "Guardando..." : boardAction.label}
                    </span>
                  </Button>
                </>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setCreate(true)}
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Nuevo</span>
                    <ChevronDown className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Captura rápida</TooltipContent>
              </Tooltip>
              <div className="grid size-9 place-items-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
                DA
              </div>
            </div>
          </header>
          <div
            className={`border-b px-4 py-2 text-xs md:px-7 ${
              dataSource === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : dataSource === "backend"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            Fuente de datos: {sourceLabel}
            {dataError ? ` — ${dataError}` : ""}
            {dataSource === "demo" || dataSource === "local-storage"
              ? " — no valida backend real"
              : ""}
          </div>
          <main className="mx-auto max-w-[1500px] p-4 md:p-7">{children}</main>
        </div>
        <QuickCreate open={create} onOpenChange={setCreate} />
        <Spotlight />
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
