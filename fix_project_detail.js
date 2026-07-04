const fs = require('fs');

let content = fs.readFileSync('src/components/projects/project-detail-view.tsx', 'utf8');

const imports = 'import { useUpdateProjectMutation } from "@/hooks/use-queries";\n';
content = imports + content;

content = content.replace(
    '  const { data, setData } = useData();',
    '  const { data } = useData();\n  const updateProjectMut = useUpdateProjectMutation();'
);

const freezeOld = `  const freeze = () => {
    // We update local state if we want, but since projects are loaded from server,
    // this would require a revalidatePath or router.refresh() in a real app,
    // plus a fetch to /api/projects/:id to change status.
    // For now we simulate the frontend behavior by updating DB via API (assuming API exists)
    fetch(\`/api/projects/\${id}\`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isFrozen: true, status: "frozen", frozenReason: "Decisión táctica manual", frozenUntil: new Date(Date.now() + 15 * 86400000).toISOString() }),
    });
    setData((d) => ({
      ...d,
      projects: d.projects.map((x) =>
        x.id === id
          ? {
              ...x,
              isFrozen: true,
              status: "frozen",
              frozenReason: "Decisión táctica manual",
              frozenUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
            }
          : x,
      ),
    }));
  };`;

const freezeNew = `  const freeze = () => {
    updateProjectMut.mutate({
      id,
      payload: {
        isFrozen: true,
        status: "frozen",
        frozenReason: "Decisión táctica manual",
        frozenUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
      }
    });
  };`;

content = content.replace(freezeOld, freezeNew);

fs.writeFileSync('src/components/projects/project-detail-view.tsx', content);
