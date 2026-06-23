"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DesktopShortcut, ShortcutType, useDesktopShortcuts } from "@/lib/hooks";

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2: Icons.Building2,
  ShoppingBag: Icons.ShoppingBag,
  Mail: Icons.Mail,
  Inbox: Icons.Inbox,
  FolderTree: Icons.FolderTree,
  AlertCircle: Icons.AlertCircle,
  Plus: Icons.Plus,
  MoreVertical: Icons.MoreVertical,
  Edit2: Icons.Edit2,
  Trash2: Icons.Trash2,
  X: Icons.X,
};

function getIcon(name?: string) {
  if (!name || !iconMap[name]) return Icons.FileText;
  return iconMap[name];
}

interface DesktopShortcutItemProps {
  shortcut: DesktopShortcut;
  onOpen: (shortcut: DesktopShortcut) => void;
  onEdit: (shortcut: DesktopShortcut) => void;
  onDelete: (id: string) => void;
}

function DesktopShortcutItem({ shortcut, onOpen, onEdit, onDelete }: DesktopShortcutItemProps) {
  const IconComponent = getIcon(shortcut.icon);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-slate-200/50 transition-colors group relative">
      {/* Icon */}
      <button
        onClick={() => onOpen(shortcut)}
        className="w-14 h-14 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
        style={{ backgroundColor: shortcut.color || "#64748b" }}
      >
        <IconComponent className="w-7 h-7 text-white" />
      </button>

      {/* Name */}
      <p className="text-sm font-medium text-slate-900 text-center truncate w-full max-w-[80px]">
        {shortcut.name}
      </p>

      {/* Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Icons.MoreVertical className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-fit">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit(shortcut);
                  setMenuOpen(false);
                }}
              >
                <Icons.Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onDelete(shortcut.id);
                  setMenuOpen(false);
                }}
              >
                <Icons.Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface ShortcutFormProps {
  initialData?: Partial<DesktopShortcut>;
  onSubmit: (data: Omit<DesktopShortcut, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onClose: () => void;
  title: string;
}

function ShortcutForm({ initialData, onSubmit, onClose, title }: ShortcutFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<ShortcutType>(initialData?.type || "custom");
  const [icon, setIcon] = useState(initialData?.icon || "FileText");
  const [color, setColor] = useState(initialData?.color || "#64748b");

  const handleSubmit = async () => {
    if (!name.trim()) return alert("El nombre es obligatorio");
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        icon,
        color,
        targetType: initialData?.targetType,
        targetId: initialData?.targetId,
        sortOrder: initialData?.sortOrder || 0,
        isPinned: initialData?.isPinned || false,
        lastOpenedAt: initialData?.lastOpenedAt,
      });
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Mi Proyecto" />
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del acceso"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v) => setType(v as ShortcutType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="project">Proyecto</SelectItem>
              <SelectItem value="module">Módulo</SelectItem>
              <SelectItem value="resource">Recurso</SelectItem>
              <SelectItem value="inbox">Inbox</SelectItem>
              <SelectItem value="alerts">Alertas</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ícono</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Building2">Edificio</SelectItem>
              <SelectItem value="ShoppingBag">Bolsa de compra</SelectItem>
              <SelectItem value="Mail">Correo</SelectItem>
              <SelectItem value="Inbox">Bandeja</SelectItem>
              <SelectItem value="FolderTree">Carpeta</SelectItem>
              <SelectItem value="AlertCircle">Alerta</SelectItem>
              <SelectItem value="FileText">Archivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex gap-2">
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14" />
          <span className="text-sm text-slate-600 flex items-center">{color}</span>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </div>
  );
}

interface ShortcutWindowProps {
  shortcut: DesktopShortcut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ShortcutWindow({ shortcut, open, onOpenChange }: ShortcutWindowProps) {
  const placeholders: Record<ShortcutType, string> = {
    system: `Este acceso abrirá ${shortcut.name} cuando el navegador del sistema esté implementado.`,
    area: `Este acceso abrirá el área ${shortcut.name} cuando el Explorador esté implementado.`,
    project: `Este acceso abrirá el proyecto ${shortcut.name} cuando esté conectado.`,
    module: `Este acceso abrirá el módulo ${shortcut.name} cuando esté conectado.`,
    resource: `Este acceso abrirá los recursos de ${shortcut.name}.`,
    inbox: `Este acceso abrirá la bandeja de entrada cuando el módulo Inbox esté implementado.`,
    alerts: `Este acceso abrirá las alertas y notificaciones cuando esté implementado.`,
    custom: `${shortcut.description || "Acceso personalizado del escritorio."}`,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{shortcut.name}</DialogTitle>
          {shortcut.description && <DialogDescription>{shortcut.description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
            {getIcon(shortcut.icon) &&
              (() => {
                const Icon = getIcon(shortcut.icon);
                return <Icon className="w-8 h-8" style={{ color: shortcut.color }} />;
              })()}
            <div>
              <p className="text-sm font-medium text-slate-600">Tipo</p>
              <p className="text-sm text-slate-900 capitalize">{shortcut.type}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm text-slate-700">{placeholders[shortcut.type]}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DesktopShortcutGrid() {
  const { shortcuts, loading, create, update, remove } = useDesktopShortcuts();
  const [openShortcut, setOpenShortcut] = useState<DesktopShortcut | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<DesktopShortcut | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async (data: Omit<DesktopShortcut, "id" | "createdAt" | "updatedAt">) => {
    await create(data);
  };

  const handleUpdate = async (data: Omit<DesktopShortcut, "id" | "createdAt" | "updatedAt">) => {
    if (!editingShortcut) return;
    await update(editingShortcut.id, data);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setDeleteConfirm(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Cargando accesos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create shortcut button */}
      <div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Icons.Plus className="w-4 h-4" />
              Nuevo Acceso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Acceso</DialogTitle>
              <DialogDescription>Agrega un nuevo acceso directo al escritorio</DialogDescription>
            </DialogHeader>
            <ShortcutForm
              title="Crear Acceso"
              onSubmit={handleCreate}
              onClose={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Shortcuts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shortcuts.map((shortcut) => (
          <DesktopShortcutItem
            key={shortcut.id}
            shortcut={shortcut}
            onOpen={setOpenShortcut}
            onEdit={setEditingShortcut}
            onDelete={setDeleteConfirm}
          />
        ))}
      </div>

      {/* Edit modal */}
      {editingShortcut && (
        <Dialog open={!!editingShortcut} onOpenChange={(open) => !open && setEditingShortcut(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Acceso</DialogTitle>
            </DialogHeader>
            <ShortcutForm
              title="Editar Acceso"
              initialData={editingShortcut}
              onSubmit={handleUpdate}
              onClose={() => setEditingShortcut(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Open window */}
      {openShortcut && (
        <ShortcutWindow
          shortcut={openShortcut}
          open={!!openShortcut}
          onOpenChange={(open) => !open && setOpenShortcut(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este acceso?</AlertDialogTitle>
              <AlertDialogDescription>
                Esto solo elimina el acceso del escritorio. No elimina la entidad original asociada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(deleteConfirm)}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
