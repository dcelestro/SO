"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CheckSquare2,
  ChevronDown,
  FolderKanban,
  Home,
  Inbox,
  Lightbulb,
  Menu,
  Plus,
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
import { QuickCreate } from "@/components/quick-create";
import { DataProvider } from "@/components/data-provider";
type NavItem = [string, string, LucideIcon];
type NavGroup = { label: string; items: NavItem[] };
const groups: NavGroup[] = [
  {
    label: "Operación",
    items: [
      ["/dashboard", "Inicio", Home],
      ["/tasks", "Tareas", CheckSquare2],
      ["/focus", "Foco semanal", Target],
    ],
  },
  {
    label: "Proyectos",
    items: [
      ["/projects", "Proyectos", FolderKanban],
      ["/ecosystem", "Ecosistema", Boxes],
      ["/freezer", "Congelador", Snowflake],
    ],
  },
  {
    label: "Recursos",
    items: [
      ["/assets", "Activos", ShieldCheck],
      ["/due-items", "Vencimientos", CalendarClock],
    ],
  },
  {
    label: "Gestión",
    items: [
      ["/ideas", "Ideas", Lightbulb],
      ["/reviews", "Revisiones", Activity],
      ["/kpis", "KPIs", BarChart3],
    ],
  },
  {
    label: "Extras",
    items: [
      ["/dashboard", "Inbox", Inbox],
      ["/dashboard", "Alertas", Bell],
      ["/dashboard", "Archivo", Archive],
      ["/settings", "Configuración", Settings],
    ],
  },
];
function Nav({ close }: { close?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex-1 space-y-5 px-3 py-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-400">
            {g.label}
          </p>
          <div className="space-y-1">
            {g.items.map(([href, label, Icon]) => (
              <Link
                onClick={close}
                href={href}
                key={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${path.startsWith(href) ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
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
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
        <div>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navegación</SheetTitle>
                <div className="flex h-16 items-center gap-3 border-b px-5">
                  <div className="grid size-8 place-items-center rounded-lg bg-slate-950 text-white">
                    N
                  </div>
                  <b>Nexo</b>
                </div>
                <Nav />
              </SheetContent>
            </Sheet>
            <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex">
              <Search className="size-4" />
              Buscar en tu ecosistema{" "}
              <kbd className="ml-auto text-[11px]">⌘ K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
          <main className="mx-auto max-w-[1500px] p-4 md:p-7">{children}</main>
        </div>
        <QuickCreate open={create} onOpenChange={setCreate} />
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
