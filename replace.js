const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles('src');
for (let file of files) {
  if (file.includes('use-app-data')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('import { useData } from "@/components/data-provider"')) {
    content = content.replace('import { useData } from "@/components/data-provider"', 'import { useAppData as useData } from "@/components/use-app-data"');
    changed = true;
  } else if (content.includes('import { DataProvider, useData } from "@/components/data-provider"')) {
    content = content.replace('import { DataProvider, useData } from "@/components/data-provider"', 'import { DataProvider } from "@/components/data-provider";\nimport { useAppData as useData } from "@/components/use-app-data"');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
  }
}
