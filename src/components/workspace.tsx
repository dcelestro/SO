// @ts-nocheck
"use client";
/* eslint-disable react-hooks/purity -- fechas relativas calculadas contra el inicio de la sesión */
import Link from "next/link";
import { useState } from "react";
import { useData } from "@/components/data-provider";
import type { Project, Task } from "@/lib/demo-data";
import {
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderKanban,
  Inbox,
  LayoutGrid,
  List,
  Pause,
  Play,
  Search,
  Snowflake,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  AttentionCard,
  ContextCard,
  DueDateBadge,
  HeroCard,
  OperationalCard,
  SectionHeader,
  SemanticBadge,
} from "@/components/visual-hierarchy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DesktopShell,
  DesktopWorkspace,
} from "@/components/desktop-shell";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export const labels: Record<string, string> = {
  active: "Activo",
  blocked: "Bloqueado",
  paused: "Pausado",
  completed: "Terminado",
  frozen: "Congelado",
  idea: "Idea",
  discarded: "Descartado",
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
  pending: "Pendiente",
  in_progress: "En curso",
  inbox: "Inbox",
  waiting: "En espera",
  done: "Realizado",
  overdue: "Vencido",
  archived: "Archivada",
  promoted: "Promovida",
  captured: "Capturada",
  evaluating: "Evaluando",
  future: "A futuro",
  converted_to_project: "Convertida",
  personal: "Personal",
  thirdparty: "Terceros",
  saas: "Producto",
  development: "Desarrollo",
  testing: "Pruebas",
  production: "Producción",
  validation: "Validación",
  design: "Diseño",
  maintenance: "Mantenimiento",
  domain: "Dominio",
  hosting: "Hosting",
  backup: "Backup",
  license: "Licencia",
  repository: "Repositorio",
  server: "Servidor",
};
const TODAY = Date.now();
export const fmt = (v?: string | Date | null | undefined) =>
  v
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
      }).format(new Date(v))
    : "-";
export const days = (v: string | Date | null | undefined) => { if (!v) return 0; return Math.ceil((new Date(v).getTime() - TODAY) / 86400000); };
export function Status({ value }: { value: string }) {
  return (
    <SemanticBadge
      value={value}
      label={labels[value] || value.replaceAll("_", " ")}
    />
  );
}
export function Header({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export function TextWithLinks({ value }: { value?: string | null }) {
  const text = value || "";
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline-offset-2 hover:underline"
          >
            {part}
          </a>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

export function Workspace({ section }: { section: string }) {
  switch (section) {
    case "dashboard":
      return <DashboardV2 />;
    case "desktop":
      return <Dashboard />;
    case "explorer":
      return <Explorer />;
    case "focus":
      return <Focus />;
    case "projects":
      return <Projects />;
    case "tasks":
      return <Tasks />;
    case "modules":
      return <Modules />;
    case "freeze":
      return <Freeze />;
    case "assets":
      return <Assets />;
    case "dues":
      return <Dues />;
    case "reviews":
      return <Reviews />;
    case "ideas":
      return <Ideas />;
    case "library":
      return <Library />;
    case "boards":
      return <Boards />;
    case "settings":
      return <Settings />;
    default:
      return <DashboardV2 />;
  }
}

function Dashboard() {
  return (
    <DesktopShell>
      <DesktopWorkspace />
    </DesktopShell>
  );
}
