"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Plus, Search } from "lucide-react";
import { AssetActionMenu } from "@/components/assets/asset-action-menu";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { Header, fmt, Status } from "@/components/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function AssetsView({
  assets,
  projects,
  areas,
}: {
  assets: any[];
  projects: any[];
  areas: any[];
}) {
  const [rows, setRows] = useState(assets);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setRows(assets);
  }, [assets]);

  function mergeAsset(updatedAsset: any) {
    setRows((current) =>
      current.map((asset) =>
        asset.id === updatedAsset.id
          ? {
              ...asset,
              ...updatedAsset,
              project: updatedAsset.project ?? asset.project,
              area: updatedAsset.area ?? asset.area,
            }
          : asset,
      ),
    );
  }

  function addAsset(asset: any) {
    setRows((current) => [asset, ...current]);
  }

  function removeAsset(assetId: string) {
    setRows((current) => current.filter((asset) => asset.id !== assetId));
  }

  const filtered = rows.filter((asset) => {
    const haystack = [
      asset.name,
      asset.provider,
      asset.project?.name,
      asset.area?.name,
      asset.url,
      asset.passwordManagerReference,
      asset.accountEmail,
      asset.username,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      haystack.includes(search.toLowerCase()) &&
      (status === "all" || asset.status === status)
    );
  });

  return (
    <>
      <Header
        title="Activos digitales"
        desc="Dónde está cada recurso importante, sin guardar contraseñas."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nuevo activo
          </Button>
        }
      />

      <AssetFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        projects={projects}
        areas={areas}
        onSaved={addAsset}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Buscar activo, proveedor, proyecto o referencia..."
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="expired">Vencidos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Acceso</TableHead>
              <TableHead>Renovación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    {asset.passwordManagerReference ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Ref: {asset.passwordManagerReference}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{asset.project?.name || "General"}</TableCell>
                <TableCell><Status value={asset.type} /></TableCell>
                <TableCell>{asset.provider || "-"}</TableCell>
                <TableCell>
                  {asset.url ? (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      Abrir <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    asset.passwordManagerReference || "-"
                  )}
                </TableCell>
                <TableCell>{fmt(asset.renewalDate)}</TableCell>
                <TableCell><Status value={asset.status} /></TableCell>
                <TableCell>
                  <AssetActionMenu
                    asset={asset}
                    projects={projects}
                    areas={areas}
                    onUpdated={mergeAsset}
                    onDeleted={removeAsset}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No hay activos para este filtro.
          </div>
        ) : null}
      </Card>

      <p className="mt-3 text-xs text-slate-500">
        Seguridad: Nexo solo registra contexto y referencias al gestor de contraseñas. Nunca almacena contraseñas, tokens ni claves privadas.
      </p>
    </>
  );
}
