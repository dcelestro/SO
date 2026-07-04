"use client";

import { useState } from "react";
import type { LibraryItem } from "@prisma/client";
import { Copy, Edit2, Archive, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function LibraryCard({ item, onEdit, onArchive }: { item: LibraryItem; onEdit: () => void; onArchive: () => void }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <>
      <Card className="flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
              <Badge variant="outline" className="shrink-0 text-xs bg-slate-50">
                {item.type}
              </Badge>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              {item.category}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-slate-600 line-clamp-3 mb-3">{item.description}</p>
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {item.variables.length > 0 && (
              <div className="mt-3 text-xs text-slate-400">
                Variables: <span className="font-mono text-slate-500">{item.variables.join(", ")}</span>
              </div>
            )}
          </CardContent>
        </div>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-2">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900" onClick={() => setViewOpen(true)}>
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900" onClick={copyToClipboard}>
              <Copy className="w-3 h-3 mr-1" />
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-500" onClick={onEdit}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={onArchive}>
              <Archive className="w-3 h-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{item.title}</DialogTitle>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-50 border rounded-md p-4 mt-2">
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">{item.content}</pre>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-slate-500">
              Última actualización: {new Date(item.updatedAt).toLocaleDateString()}
            </div>
            <Button onClick={copyToClipboard} variant="default" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Contenido copiado" : "Copiar al portapapeles"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
