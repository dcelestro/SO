const fs = require('fs');
let content = fs.readFileSync('src/components/workspace.tsx', 'utf8');

content = content.replace(
  /export const days = \(v: string\) =>\r?\n\s*Math\.ceil\(\(new Date\(v\)\.getTime\(\) - TODAY\) \/ 86400000\);/g,
  'export const days = (v: string | Date | null | undefined) => { if (!v) return 0; return Math.ceil((new Date(v).getTime() - TODAY) / 86400000); };'
);

content = content.replace(
  /export const fmt = \(v\?: string\) =>/g,
  'export const fmt = (v?: string | Date | null | undefined) =>'
);

fs.writeFileSync('src/components/workspace.tsx', content);
console.log("Fixed days and fmt signatures");
