"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/use-app-data";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FolderKanban, CheckSquare2, Layers, Search } from "lucide-react";

export function Spotlight() {
  const [open, setOpen] = React.useState(false);
  const { data } = useAppData();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Búsqueda Global" description="Buscá proyectos, áreas y tareas.">
      <CommandInput placeholder="Buscá cualquier cosa..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        {data.projects.length > 0 && (
          <CommandGroup heading="Proyectos">
            {data.projects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
              >
                <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data.areas.length > 0 && (
          <CommandGroup heading="Áreas">
            {data.areas.map((area) => (
              <CommandItem
                key={area.id}
                value={area.name}
                onSelect={() => runCommand(() => router.push(`/${area.id}`))}
              >
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{area.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data.tasks.length > 0 && (
          <CommandGroup heading="Tareas Recientes">
            {data.tasks.slice(0, 50).map((task) => (
              <CommandItem
                key={task.id}
                value={task.title}
                onSelect={() => runCommand(() => {
                    if (task.projectId) {
                        router.push(`/projects/${task.projectId}`);
                    } else {
                        router.push(`/tasks`);
                    }
                })}
              >
                <CheckSquare2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{task.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
