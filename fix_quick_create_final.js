const fs = require('fs');

let content = fs.readFileSync('src/components/quick-create.tsx', 'utf8');

// Replace imports first
content = content.replace(
  'import { useCreateTaskMutation, useCreateProjectMutation, useCreateAssetMutation, useCreateIdeaMutation, useCreateDueItemMutation, useCreateReviewMutation } from "@/hooks/use-queries";',
  'import { useCreateTaskMutation, useCreateProjectMutation, useCreateAssetMutation, useCreateIdeaMutation, useCreateDueItemMutation, useCreateReviewMutation } from "@/hooks/use-queries";'
);

if (!content.includes('useCreateAssetMutation')) {
  content = content.replace(
    'import { useCreateTaskMutation, useCreateProjectMutation } from "@/hooks/use-queries";',
    'import { useCreateTaskMutation, useCreateProjectMutation, useCreateAssetMutation, useCreateIdeaMutation, useCreateDueItemMutation, useCreateReviewMutation } from "@/hooks/use-queries";'
  );
}

// Remove legacy imports
content = content.replace('import { createProject } from "@/actions/projects";\n', '');
content = content.replace('import { createTask } from "@/actions/tasks";\n', '');
content = content.replace('import { nanoid } from "@/lib/id";\n', '');

// Find function save(fd: FormData) and replace it until `return (\n    <Dialog`
const startStr = '  function save(fd: FormData) {';
const endStr = '  return (\n    <Dialog open={open} onOpenChange={onOpenChange}>';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newSaveFunction = `  const createProjectMut = useCreateProjectMutation();
  const createTaskMut = useCreateTaskMutation();
  const createAssetMut = useCreateAssetMutation();
  const createIdeaMut = useCreateIdeaMutation();
  const createDueItemMut = useCreateDueItemMutation();
  const createReviewMut = useCreateReviewMutation();

  function save(fd: FormData) {
    const title = String(fd.get("title") || "").trim();
    const rawProject = String(fd.get("projectId") || "");
    const projectId = rawProject === "none" ? undefined : rawProject || undefined;
    const areaId =
      String(fd.get("areaId") || "") ||
      data.projects.find((p) => p.id === projectId)?.areaId;

    if (!title) {
      setError("Escribí un título concreto.");
      return;
    }

    const date = String(fd.get("date") || "") || undefined;
    const priority = String(fd.get("priority") || "medium");
    const description = String(fd.get("description") || "");

    if (kind === "project") {
      const status = String(fd.get("status") || "idea");
      const nextAction = String(fd.get("nextAction") || "").trim();

      if (!areaId) {
        setError("Seleccioná un área.");
        return;
      }
      if (status === "active" && !nextAction) {
        setError("Todo proyecto activo debe tener una próxima acción concreta.");
        return;
      }

      createProjectMut.mutate({
        name: title,
        description,
        areaId,
        status,
        priority,
        maturity: "idea",
        projectType: "other",
        nextAction: nextAction || undefined,
      });
    } else if (kind === "task") {
      createTaskMut.mutate({
        title,
        projectId,
        status: projectId ? "pending" : "inbox",
        priority,
        dueDate: date,
      });
    } else if (kind === "idea") {
      createIdeaMut.mutate({
        title,
        description,
        areaId,
        potential: priority,
        complexity: "medium",
        status: "captured",
        reviewDate: date,
      });
    } else if (kind === "asset") {
      createAssetMut.mutate({
        name: title,
        projectId,
        type: String(fd.get("type") || "other"),
        provider: String(fd.get("provider") || ""),
        renewalDate: date,
        status: "active",
      });
    } else if (kind === "due") {
      createDueItemMut.mutate({
        title,
        projectId,
        type: String(fd.get("type") || "other"),
        dueDate: date || new Date().toISOString(),
        status: "pending",
      });
    } else {
      createReviewMut.mutate({
        title,
        projectId,
        type: "project_review",
        frequency: "monthly",
        nextReviewDate: date || new Date().toISOString(),
        status: "pending",
      });
    }

    setError("");
    onOpenChange(false);
  }

`;

  content = content.substring(0, startIndex) + newSaveFunction + content.substring(endIndex);
  fs.writeFileSync('src/components/quick-create.tsx', content);
  console.log('Successfully replaced save function in quick-create.tsx');
} else {
  console.error('Could not find start or end strings in quick-create.tsx');
}
