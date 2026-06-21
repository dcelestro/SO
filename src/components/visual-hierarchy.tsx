import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "focus" | "success" | "muted";

const toneStyles: Record<Tone, string> = {
  critical: "border-red-500 bg-red-50/90 text-red-950",
  warning: "border-orange-500 bg-orange-50/90 text-orange-950",
  focus: "border-blue-600 bg-blue-50/90 text-blue-950",
  success: "border-emerald-500 bg-emerald-50/90 text-emerald-950",
  muted: "border-slate-400 bg-slate-50 text-slate-800",
};

const iconStyles: Record<Tone, string> = {
  critical: "bg-red-100 text-red-600",
  warning: "bg-orange-100 text-orange-600",
  focus: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  muted: "bg-slate-200 text-slate-600",
};

export function HeroCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-900 bg-slate-950 text-slate-50 shadow-sm",
        className,
      )}
    >
      <CardHeader>
        {Icon && (
          <div className="mb-1 grid size-9 place-items-center rounded-lg bg-amber-400/10 text-amber-400">
            <Icon className="size-4" />
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-amber-400">
          {eyebrow}
        </p>
        <CardTitle className="text-2xl leading-tight md:text-[28px]">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="max-w-3xl text-sm leading-relaxed text-slate-300">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function AttentionCard({
  tone = "warning",
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-l-4 shadow-none", toneStyles[tone], className)}>
      {(title || description || Icon) && (
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <div
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  iconStyles[tone],
                )}
              >
                <Icon className="size-4" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1 text-slate-600">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function OperationalCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-slate-200 bg-white shadow-none", className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function ContextCard({
  label,
  value,
  detail,
  critical,
  className,
}: {
  label: string;
  value: string | number;
  detail?: string;
  critical?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-slate-50/80 p-4",
        critical && "border-red-200 bg-red-50",
        className,
      )}
    >
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight text-slate-800",
          critical && "text-red-700",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
      {detail && <p className="mt-2 text-[11px] text-slate-400">{detail}</p>}
    </div>
  );
}

const semantic: Record<string, string> = {
  active: "border-blue-200 bg-blue-50 text-blue-700",
  blocked: "border-red-200 bg-red-50 text-red-700",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  frozen: "border-slate-200 bg-slate-100 text-slate-600",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  discarded: "border-slate-200 bg-slate-50 text-slate-400",
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  low: "border-slate-200 bg-slate-50 text-slate-500",
  overdue: "border-red-200 bg-red-50 text-red-700",
  focus: "border-blue-700 bg-blue-700 text-white",
  secondary: "border-blue-200 bg-blue-50 text-blue-700",
  avoid: "border-amber-200 bg-amber-50 text-amber-700",
  future: "border-slate-200 bg-slate-50 text-slate-500",
  captured: "border-slate-200 bg-slate-50 text-slate-600",
  evaluating: "border-blue-200 bg-blue-50 text-blue-700",
  converted_to_project: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
export function SemanticBadge({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        semantic[value] || semantic.medium,
        className,
      )}
    >
      {label || value.replaceAll("_", " ")}
    </Badge>
  );
}

export function DueDateBadge({
  days,
  done = false,
}: {
  days: number;
  done?: boolean;
}) {
  const tone = done
    ? "completed"
    : days < 0
      ? "overdue"
      : days <= 7
        ? "high"
        : days <= 30
          ? "paused"
          : "future";
  const text = done
    ? "Completado"
    : days < 0
      ? `${Math.abs(days)}d vencido`
      : days === 0
        ? "Vence hoy"
        : days <= 7
          ? `${days} días`
          : days <= 30
            ? `${days} días`
            : `${days} días`;
  return <SemanticBadge value={tone} label={text} />;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[.15em] text-slate-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
