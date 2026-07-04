import { useData } from "@/components/data-provider";
import { useAreasQuery, useProjectsQuery, useTasksQuery, useModulesQuery } from "@/hooks/use-queries";

export function useAppData() {
  const { data: baseData, setData, dataSource, dataError, reset } = useData();
  const { data: areas = [] } = useAreasQuery();
  const { data: projects = [] } = useProjectsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: modules = [] } = useModulesQuery();

  const data = {
    ...baseData,
    areas: areas.length ? areas : baseData.areas,
    projects: projects.length ? projects : baseData.projects,
    tasks: tasks.length ? tasks : baseData.tasks,
    modules: modules.length ? modules : (baseData as any).modules || [],
  };

  return { data, setData, dataSource, dataError, reset };
}
