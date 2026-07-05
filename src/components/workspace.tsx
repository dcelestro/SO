"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SemanticBadge } from "@/components/visual-hierarchy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const labels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
  paused: "Pausado",
  completed: "Terminado",
  frozen: "Congelado",
  idea: "Idea",
  analysis: "Análisis",
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
  database: "Base de datos",
  email: "Email",
  api: "API",
  repository: "Repositorio",
  cloud_service: "Servicio cloud",
  payment_gateway: "Pasarela de pago",
  social_media: "Red social",
  design_file: "Archivo de diseño",
  analytics: "Analítica",
  backup: "Backup",
  server: "Servidor",
  legal_tax: "Legal / fiscal",
  license: "Licencia",
  subscription: "Suscripción",
  ssl: "SSL",
  tax: "Impuesto",
  review: "Revisión",
  none: "Sin recurrencia",
  weekly: "Semanal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  yearly: "Anual",
  custom: "Personalizada",
  other: "Otro",
  expired: "Vencido",
  cancelled: "Cancelado",
};

const TODAY = Date.now();

export const fmt = (value?: string | Date | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
      }).format(new Date(value))
    : "-";

export const days = (value: string | Date | null | undefined) => {
  if (!value) return 0;
  return Math.ceil((new Date(value).getTime() - TODAY) / 86400000);
};

export function Status({ value }: { value?: string | null }) {
  const safeValue = value || "pending";
  return (
    <SemanticBadge
      value={safeValue}
      label={labels[safeValue] || safeValue.replaceAll("_", " ")}
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

export function Metric({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className={`text-2xl font-semibold ${alert && value ? "text-red-600" : ""}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function TaskLine({ task }: { task: any }) {
  return (
    <div className="flex items-center gap-3 border-t py-3 first:border-0">
      <CheckCircle2 className="size-5 text-slate-300" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">
          <TextWithLinks value={task.title} />
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {task.project?.name || "Inbox"} · {task.dueDate ? fmt(task.dueDate) : "Sin fecha"}
        </p>
      </div>
      <Status value={task.priority} />
    </div>
  );
}

export function Workspace({ section }: { section: string; id?: string }) {
  return <WorkspacePlaceholder section={section} />;
}

function WorkspacePlaceholder({ section }: { section: string }) {
  const knownRoutes: Record<string, string> = {
    dashboard: "/dashboard",
    projects: "/projects",
    tasks: "/tasks",
    assets: "/assets",
    ideas: "/ideas",
    vencimientos: "/vencimientos",
  };

  const href = knownRoutes[section];

  return (
    <>
      <Header
        title={labels[section] || section.replaceAll("-", " ")}
        desc="Esta vista está preparada para conectarse a su pantalla específica."
        action={
          href ? (
            <Button asChild variant="outline">
              <Link href={href}>Abrir vista</Link>
            </Button>
          ) : null
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vista en preparación</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty text="Esta sección todavía no tiene una pantalla propia conectada en esta ruta." />
        </CardContent>
      </Card>
    </>
  );
}
