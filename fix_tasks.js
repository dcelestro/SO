const fs = require('fs');

let content = fs.readFileSync('src/components/workspace.tsx', 'utf8');

content = content.replace(
    'function Tasks() {\n  const { data, setData } = useData();',
    'function Tasks() {\n  const { data } = useData();\n  const updateTaskMut = useUpdateTaskMutation();'
);

content = content.replace(
    '                          <Select\n                            value={t.status}\n                            onValueChange={(v) =>\n                              setData((d) => ({\n                                ...d,\n                                tasks: d.tasks.map((x) =>\n                                  x.id === t.id ? { ...x, status: v } : x,\n                                ),\n                              }))\n                            }\n                          >',
    '                          <Select\n                            value={t.status}\n                            onValueChange={(v) => updateTaskMut.mutate({ id: t.id, payload: { status: v } })}\n                          >'
);

fs.writeFileSync('src/components/workspace.tsx', content);
