const fs = require('fs');
let data = fs.readFileSync('src/lib/demo-data.ts', 'utf8');
data = data.replace(/status: "captured"/g, 'status: "inbox"');
data = data.replace(/IdeaStatus = "captured"/g, 'IdeaStatus = "inbox"');
// Let's add default origin and destination to ideas
data = data.replace(/export type Idea = \{/g, 'export type Idea = {\n  origin?: "saas" | "thirdparty" | "personal";\n  destination?: string | null;');
fs.writeFileSync('src/lib/demo-data.ts', data);
