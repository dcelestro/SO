import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.AUTH_ENABLED === "true") {
    const token = (await cookies()).get("nexo_session")?.value;
    if (!(await verifySession(token))) redirect("/login");
  }
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
