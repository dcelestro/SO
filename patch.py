import re

with open('src/components/workspace.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = 'import { useProjectsQuery, useTasksQuery, useUpdateTaskMutation, useUpdateProjectMutation } from "@/hooks/use-queries";\n'
content = content.replace('import { updateTask } from "@/actions/tasks";', imports)

# TaskLine
content = re.sub(
    r'export function TaskLine\(\{ task \}: \{ task: any \}\) \{\s*const \{ data, setData \} = useData\(\);',
    r'export function TaskLine({ task }: { task: any }) {\n  const { data } = useData();\n  const { data: projects = [] } = useProjectsQuery();\n  const updateTaskMut = useUpdateTaskMutation();',
    content
)
content = re.sub(r'const project = data\.projects', 'const project = projects', content)
content = content.replace(
    '  const [isPending, startTransition] = useTransition();\n  function update(status: string) {\n    const prevTasks = data.tasks;\n    setData((d) => ({\n      ...d,\n      tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status } : t)),\n    }));\n    startTransition(async () => {\n      try {\n        await updateTask(task.id, { status });\n      } catch (e) {\n        setData((d) => ({ ...d, tasks: prevTasks }));\n      }\n    });\n  }',
    '  function update(status: string) {\n    updateTaskMut.mutate({ id: task.id, payload: { status } });\n  }'
)

# For other components, we inject the hooks and replace data.projects/data.tasks
components_to_patch = ['Focus', 'Ecosystem', 'Freezer', 'Assets', 'Ideas', 'Dues', 'Reviews', 'Kpis']
for comp in components_to_patch:
    # Find the function definition
    content = re.sub(
        rf'function {comp}\(\) {{\s*const {{ data(, setData)? }} = useData\(\)(,|;)',
        f'function {comp}() {{\n  const {{ data\\g<1> }} = useData()\\g<2>\n  const {{ data: projects = [] }} = useProjectsQuery();\n  const {{ data: tasks = [] }} = useTasksQuery();\n  const updateProjectMut = useUpdateProjectMutation();\n',
        content
    )

content = content.replace('data.projects', 'projects')
content = content.replace('d.projects', 'projects')
content = content.replace('data.tasks', 'tasks')
content = content.replace('d.tasks', 'tasks')

# Freezer mutation fix
content = re.sub(
    r'onClick=\{\(\) =>\s*setData\(\(d\) => \(\{\s*\.\.\.d,\s*projects: projects\.map\(\(x\) =>\s*x\.id === p\.id\s*\?\s*\{\s*\.\.\.x,\s*isFrozen: false,\s*status: "paused",\s*frozenReason: undefined,\s*\}\s*:\s*x,\s*\),\s*\}\)\)\s*\}',
    r'onClick={() => updateProjectMut.mutate({ id: p.id, payload: { isFrozen: false, status: "paused", frozenReason: null } })}',
    content
)

with open('src/components/workspace.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
