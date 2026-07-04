const fs = require('fs');
let c = fs.readFileSync('src/components/desktop-shell.tsx', 'utf8');
c = c.replace('{ label: "Explorador", Icon: Compass }', '{ href: "/explorer", label: "Explorador", Icon: Compass }');
c = c.replace('{ label: "Inbox", Icon: Inbox }', '{ href: "/tasks?tab=inbox", label: "Inbox", Icon: Inbox }');
fs.writeFileSync('src/components/desktop-shell.tsx', c);
console.log("Fixed desktop-shell");
