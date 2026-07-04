const fs = require('fs');

let content = fs.readFileSync('src/components/app-shell.tsx', 'utf8');

// Find the last bit that is intact:
const lastIntact = '            {dataSource === "demo" || dataSource === "local-storage"';
const indexOfLast = content.indexOf(lastIntact);

if (indexOfLast !== -1) {
  content = content.substring(0, indexOfLast + lastIntact.length) + `
              ? " — no valida backend real"
              : ""}
          </div>
          <main className="mx-auto max-w-[1500px] p-4 md:p-7">{children}</main>
        </div>
        <QuickCreate open={create} onOpenChange={setCreate} />
        <Spotlight />
      </div>
    </TooltipProvider>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}
`;
  fs.writeFileSync('src/components/app-shell.tsx', content);
}
