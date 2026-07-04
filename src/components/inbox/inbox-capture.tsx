"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useCreateIdeaMutation } from "@/hooks/use-queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lightbulb, Send } from "lucide-react";

export function InboxCapture() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [isPending, startTransition] = useTransition();
  const createIdeaMut = useCreateIdeaMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // 'i' or 'I' opens Inbox
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    
    startTransition(() => {
      createIdeaMut.mutate({
        title: title.trim(),
        destination: destination.trim() || undefined,
        origin: "personal",
      });
      setOpen(false);
      setTitle("");
      setDestination("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white/90 backdrop-blur-xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 text-slate-500">
            <Lightbulb className="size-5 text-amber-500" />
            <span className="text-sm font-semibold tracking-wide uppercase">Inbox - Nueva Idea</span>
          </div>
          
          <div className="px-4 py-2">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Escribe tu idea aquí... (Enter para guardar)"
              className="text-xl border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-300 bg-transparent h-auto py-2"
              disabled={isPending}
            />
          </div>

          <div className="px-4 pb-4 flex items-center border-t border-slate-100 pt-3 mt-2 bg-slate-50/50">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destino (ej. Abundia, Hogar)..."
              className="h-8 text-xs border-slate-200 bg-white w-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              disabled={isPending}
            />
            <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
              Presiona <kbd className="font-sans font-semibold border rounded px-1.5 shadow-sm bg-white">Enter</kbd> para guardar
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
