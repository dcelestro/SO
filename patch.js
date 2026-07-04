const fs = require('fs');

let content = fs.readFileSync('src/components/workspace.tsx', 'utf-8');

const imports = 'import { useProjectsQuery, useTasksQuery, useUpdateTaskMutation, useUpdateProjectMutation } from "@/hooks/use-queries";\n';
content = content.replace('import { updateTask } from "@/actions/tasks";', imports);

// TaskLine
content = content.replace(
    'export function TaskLine({ task }: { task: any }) {\n  const { data, setData } = useData();',
    'export function TaskLine({ task }: { task: any }) {\n  const { data } = useData();\n  const { data: projects = [] } = useProjectsQuery();\n  const updateTaskMut = useUpdateTaskMutation();'
);
content = content.replace(/const project = data\.projects/g, 'const project = projects');
content = content.replace(
    '  const [isPending, startTransition] = useTransition();\n  function update(status: string) {\n    const prevTasks = data.tasks;\n    setData((d) => ({\n      ...d,\n      tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status } : t)),\n    }));\n    startTransition(async () => {\n      try {\n        await updateTask(task.id, { status });\n      } catch (e) {\n        setData((d) => ({ ...d, tasks: prevTasks }));\n      }\n    });\n  }',
    '  function update(status: string) {\n    updateTaskMut.mutate({ id: task.id, payload: { status } });\n  }'
);

const components_to_patch = ['Focus', 'Ecosystem', 'Freezer', 'Assets', 'Ideas', 'Dues', 'Reviews', 'Kpis'];
for (const comp of components_to_patch) {
    const re1 = new RegExp(`function ${comp}\\(\\) \\{\\s*const \\{ data, setData \\} = useData\\(\\),?`, 'g');
    const re2 = new RegExp(`function ${comp}\\(\\) \\{\\s*const \\{ data \\} = useData\\(\\),?`, 'g');
    
    const replacement = `function ${comp}() {\n  const { data } = useData();\n  const { data: projects = [] } = useProjectsQuery();\n  const { data: tasks = [] } = useTasksQuery();\n  const updateProjectMut = useUpdateProjectMutation();\n`;
    
    content = content.replace(re1, replacement);
    content = content.replace(re2, replacement);
}

content = content.replace(/data\.projects/g, 'projects');
content = content.replace(/d\.projects/g, 'projects');
content = content.replace(/data\.tasks/g, 'tasks');
content = content.replace(/d\.tasks/g, 'tasks');

const freezerMutationOld = `onClick={() =>
                        setData((d) => ({
                          ...d,
                          projects: d.projects.map((x) =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  isFrozen: false,
                                  status: "paused",
                                  frozenReason: undefined,
                                }
                              : x,
                          ),
                        }))
                      }`;
const freezerMutationNew = `onClick={() => updateProjectMut.mutate({ id: p.id, payload: { isFrozen: false, status: "paused", frozenReason: null } })}`;
// We might just use a regex for Freezer mutation
content = content.replace(/onClick=\{\(\) =>\s*setData\(\(d\) => \(\{\s*\.\.\.d,\s*projects: projects\.map\(\(x\) =>\s*x\.id === p\.id\s*\?\s*\{\s*\.\.\.x,\s*isFrozen: false,\s*status: "paused",\s*frozenReason: undefined,\s*\}\s*:\s*x,\s*\),\s*\}\)\)\s*\}/g, freezerMutationNew);

fs.writeFileSync('src/components/workspace.tsx', content, 'utf-8');
