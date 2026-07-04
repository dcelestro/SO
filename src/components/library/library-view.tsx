"use client";

import { useState, useMemo } from "react";
import type { LibraryItem, LibraryItemType, LibraryItemCategory } from "@prisma/client";
import { Plus, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LibraryCard } from "./library-card";
import { LibraryFormModal } from "./library-form-modal";
import { archiveLibraryItem } from "@/actions/library";
import { Header, Empty } from "@/components/workspace";

export function LibraryView({ initialItems }: { initialItems: LibraryItem[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LibraryItemType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<LibraryItemCategory | "all">("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | undefined>(undefined);

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchSearch = search
        ? item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        : true;
      const matchType = typeFilter === "all" ? true : item.type === typeFilter;
      const matchCategory = categoryFilter === "all" ? true : item.category === categoryFilter;
      return matchSearch && matchType && matchCategory;
    });
  }, [initialItems, search, typeFilter, categoryFilter]);

  const handleCreate = () => {
    setEditingItem(undefined);
    setModalOpen(true);
  };

  const handleEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("¿Seguro que quieres archivar este template?")) {
      await archiveLibraryItem(id);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto max-w-6xl p-6 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <Header 
              title="Biblioteca" 
              desc="Templates, prompts y modelos reutilizables para acelerar trabajo futuro." 
            />
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo template
            </Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por título, descripción o tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as LibraryItemType | "all")}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="prompt">Prompt</SelectItem>
                  <SelectItem value="document_template">Plantilla de documento</SelectItem>
                  <SelectItem value="client_message">Mensaje a cliente</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="dev_issue">Issue para Dev</SelectItem>
                  <SelectItem value="functional_spec">Spec Funcional</SelectItem>
                  <SelectItem value="technical_spec">Spec Técnica</SelectItem>
                  <SelectItem value="report">Reporte</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as LibraryItemCategory | "all")}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="desarrollo">Desarrollo</SelectItem>
                  <SelectItem value="documentacion">Documentación</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="operacion">Operación</SelectItem>
                  <SelectItem value="prompts">Prompts</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onArchive={() => handleArchive(item.id)}
                />
              ))}
            </div>
          ) : (
            <Empty text="No se encontraron templates que coincidan con tu búsqueda." />
          )}
        </div>
      </div>

      <LibraryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editingItem}
        onSaved={() => {
          // Revalidation happens in server action
        }}
      />
    </div>
  );
}
