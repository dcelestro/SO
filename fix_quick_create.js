const fs = require('fs');

let content = fs.readFileSync('src/components/quick-create.tsx', 'utf8');

const imports = 'import { useCreateTaskMutation, useCreateProjectMutation } from "@/hooks/use-queries";\n';
content = imports + content;

content = content.replace(
    '  const { data, setData } = useData();\n  const [open, setOpen] = useState(false);',
    '  const { data, setData } = useData();\n  const createTaskMut = useCreateTaskMutation();\n  const createProjectMut = useCreateProjectMutation();\n  const [open, setOpen] = useState(false);'
);

// Replace project creation (around line 80)
const projectCreationOld = `      setData((d) => ({
        ...d,
        projects: [
          {
            id,
            name: title,
            description: String(fd.get("description") || ""),
            areaId,
            status: "active",
            priority,
            maturity: "validation",
            projectType: "other",
            progressPercentage: 0,
            updatedAt: now,
          },
          ...d.projects,
        ],
      }));`;
const projectCreationNew = `      createProjectMut.mutate({
        name: title,
        description: String(fd.get("description") || ""),
        areaId,
        status: "active",
        priority,
        maturity: "validation",
        projectType: "other",
        progressPercentage: 0,
        updatedAt: now,
      });`;
content = content.replace(projectCreationOld, projectCreationNew);

// Replace task creation (around line 100)
const taskCreationOld = `      setData((d) => ({
        ...d,
        tasks: [
          {
            id,
            title,
            projectId,
            status: projectId ? "pending" : "inbox",
            priority,
            dueDate: date,
          },
          ...d.tasks,
        ],
      }));`;
const taskCreationNew = `      createTaskMut.mutate({
        title,
        projectId,
        status: projectId ? "pending" : "inbox",
        priority,
        dueDate: date,
      });`;
content = content.replace(taskCreationOld, taskCreationNew);

fs.writeFileSync('src/components/quick-create.tsx', content);
