import { TasksView } from "@/components/tasks/tasks-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const query = await searchParams;
  const tab = query.tab || "today";

  // Note: For the MVP, we are loading all tasks that aren't completed/discarded to populate kanban/lists properly.
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      status: {
        notIn: ["completed", "discarded"],
      },
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <TasksView initialTasks={tasks as any} initialTab={tab} />;
}
