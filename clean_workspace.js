const fs = require('fs');
let code = fs.readFileSync('src/components/workspace.tsx', 'utf8');

// Find the first occurrence of `export function Header({`
const headerIdx = code.indexOf('export function Header({');

// Find the first occurrence of `export const days =`
const daysIdx = code.indexOf('export const days =');
// Find the end of `days` function (it ends with `};`)
const endOfDaysIdx = code.indexOf('};', daysIdx) + 2;

// The corrupted block is between endOfDaysIdx and headerIdx
const head = code.slice(0, endOfDaysIdx);
const tail = code.slice(headerIdx);

const statusFunc = `
export function Status({ value }: { value: string }) {
  return (
    <SemanticBadge
      value={value}
      label={labels[value] || value.replaceAll("_", " ")}
    />
  );
}
`;

const finalCode = head + '\n' + statusFunc + tail;
fs.writeFileSync('src/components/workspace.tsx', finalCode);
console.log("Fixed workspace.tsx");
