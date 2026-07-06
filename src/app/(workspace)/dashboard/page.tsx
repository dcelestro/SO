import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardRadar } from "@/lib/dashboard-radar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const radar = await getDashboardRadar();

  return <DashboardView radar={radar} />;
}
