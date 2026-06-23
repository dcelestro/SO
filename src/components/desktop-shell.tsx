"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Bell,
  Compass,
  Folder,
  Home,
  Inbox,
  Layers,
  Menu,
  Target,
  X,
  CheckSquare2,
  FolderKanban,
  Lightbulb,
  Activity,
  BarChart3,
  CalendarClock,
  Snowflake,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DesktopShortcutGrid } from "@/components/desktop-shortcuts";

const sidebarGroups = [
  {
    label: "Accesos",
    items: [
      { href: "/dashboard", label: "Escritorio", Icon: Home },
      { label: "Explorador", Icon: Compass },
      { label: "Inbox", Icon: Inbox },
      { label: "Alertas", Icon: Bell },
      { label: "Recursos", Icon: Layers },
      { label: "Archivo", Icon: Archive },
      { href: "/settings", label: "Configuración", Icon: Folder },
    ],
  },
  {
    label: "Operación",
    items: [
      { href: "/tasks", label: "Tareas", Icon: CheckSquare2 },
      { href: "/focus", label: "Foco semanal", Icon: Target },
    ],
  },
  {
    label: "Proyectos",
    items: [
      { href: "/projects", label: "Proyectos", Icon: FolderKanban },
      { href: "/ecosystem", label: "Ecosistema", Icon: Compass },
      { href: "/freezer", label: "Congelador", Icon: Snowflake },
    ],
  },
  {
    label: "Recursos",
    items: [
      { href: "/assets", label: "Activos", Icon: ShieldCheck },
      { href: "/due-items", label: "Vencimientos", Icon: CalendarClock },
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
];

type DesktopShellProps = {
  children: ReactNode;
};

export function DesktopShell({ children }: DesktopShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <DesktopCanvas>{children}</DesktopCanvas>
    </div>
  );
}

function DesktopCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}

export function PlaceholderBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-200/40">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function WindowHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border-b border-slate-200 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function WindowContent({ children }: { children: ReactNode }) {
  return <div className="mt-6 text-sm leading-7 text-slate-600">{children}</div>;
}

export function WindowActions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-wrap gap-3">{children}</div>;
}

export function ModalWindow({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <DialogHeader>
          <WindowHeader title="Ventana de prueba" subtitle="Base de ventanas/modal preparada" />
        </DialogHeader>
        <WindowContent>
          <p>
            Esta ventana es una demostración de la estructura que podrá alojar proyectos,
            recursos, alertas y documentos en futuras iteraciones.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Por ahora es un placeholder reutilizable que demuestra la lógica de abrir y cerrar
            ventanas desde el escritorio.
          </p>
        </WindowContent>
        <WindowActions>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Entendido</Button>
        </WindowActions>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-900"
          >
            <X className="size-5" />
            <span className="sr-only">Cerrar ventana</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export function DesktopWorkspace() {
  return (
    <DesktopCanvas>
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-sm shadow-slate-200/40">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Escritorio</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Accesos Directos
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tu superficie de trabajo personal. Crea, organiza y accede a tus áreas, proyectos e herramientas desde aquí.
          </p>
        </div>

        <DesktopShortcutGrid />
      </div>
    </DesktopCanvas>
  );
}
