"use client";

import { useEffect, useState, useTransition } from "react";
import { createAsset, updateAsset } from "@/actions/assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const none = "__none__";

const assetTypes = [
  ["domain", "Dominio"],
  ["hosting", "Hosting"],
  ["database", "Base de datos"],
  ["email", "Email"],
  ["api", "API"],
  ["repository", "Repositorio"],
  ["cloud_service", "Servicio cloud"],
  ["payment_gateway", "Pasarela de pago"],
  ["social_media", "Red social"],
  ["design_file", "Archivo de diseño"],
  ["analytics", "Analítica"],
  ["backup", "Backup"],
  ["server", "Servidor"],
  ["legal_tax", "Legal / fiscal"],
  ["other", "Otro"],
] as const;

const statuses = [
  ["active", "Activo"],
  ["inactive", "Inactivo"],
  ["pending", "Pendiente"],
  ["expired", "Vencido"],
  ["cancelled", "Cancelado"],
] as const;

const currencies = ["ARS", "USD", "EUR"] as const;

function dateValue(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

type AssetFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: any;
  projects: any[];
  areas: any[];
  onSaved?: (asset: any) => void;
};

export function AssetFormModal({
  open,
  onOpenChange,
  asset,
  projects,
  areas,
  onSaved,
}: AssetFormModalProps) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(none);
  const [areaId, setAreaId] = useState(none);
  const [type, setType] = useState("domain");
  const [provider, setProvider] = useState("");
  const [url, setUrl] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [username, setUsername] = useState("");
  const [passwordManagerReference, setPasswordManagerReference] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setName(asset?.name ?? "");
    setProjectId(asset?.projectId ?? none);
    setAreaId(asset?.areaId ?? none);
    setType(asset?.type ?? "domain");
    setProvider(asset?.provider ?? "");
    setUrl(asset?.url ?? "");
    setAccountEmail(asset?.accountEmail ?? "");
    setUsername(asset?.username ?? "");
    setPasswordManagerReference(asset?.passwordManagerReference ?? "");
    setRenewalDate(dateValue(asset?.renewalDate));
    setCost(asset?.cost == null ? "" : String(asset.cost));
    setCurrency(asset?.currency ?? "ARS");
    setStatus(asset?.status ?? "active");
    setNotes(asset?.notes ?? "");
    setError("");
  }, [asset, open]);

  function save() {
    startTransition(async () => {
      setError("");

      try {
        const payload = {
          name: name.trim(),
          projectId: projectId === none ? null : projectId,
          areaId: areaId === none ? null : areaId,
          type,
          provider: provider.trim() || null,
          url: url.trim() || null,
          accountEmail: accountEmail.trim() || null,
          username: username.trim() || null,
          passwordManagerReference: passwordManagerReference.trim() || null,
          renewalDate: renewalDate || null,
          cost: cost ? Number(cost) : null,
          currency: currency || null,
          status,
          notes: notes.trim() || null,
        };

        const savedAsset = asset
          ? await updateAsset(asset.id, payload)
          : await createAsset(payload);

        onSaved?.(savedAsset);
        onOpenChange(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar el activo.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{asset ? "Editar activo" : "Nuevo activo"}</DialogTitle>
          <DialogDescription>
            Registrá contexto operativo. No guardes contraseñas, tokens ni claves privadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>General</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Área">
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Sin área</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {assetTypes.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Proveedor">
              <Input value={provider} onChange={(event) => setProvider(event.target.value)} />
            </Field>

            <Field label="Estado">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="URL de acceso">
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email de cuenta">
              <Input value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} />
            </Field>

            <Field label="Usuario">
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </Field>
          </div>

          <Field label="Referencia en La Caja / gestor de contraseñas">
            <Input
              value={passwordManagerReference}
              onChange={(event) => setPasswordManagerReference(event.target.value)}
              placeholder="Ej: La Caja > Cloudflare > abundia.app"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Renovación">
              <Input type="date" value={renewalDate} onChange={(event) => setRenewalDate(event.target.value)} />
            </Field>

            <Field label="Costo">
              <Input type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} />
            </Field>

            <Field label="Moneda">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Notas">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </Field>

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Seguridad: Nexo solo registra referencias y contexto. La contraseña, tokens y claves quedan fuera de la app.
          </p>

          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
