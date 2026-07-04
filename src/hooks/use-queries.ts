"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { getProjects, createProject, updateProject, deleteProject } from "@/actions/projects";
import { getAreas, createArea, updateArea, deleteArea } from "@/actions/areas";
import { getModules, createModule, updateModule, deleteModule } from "@/actions/modules";
import { createAsset } from "@/actions/assets";
import { createIdea } from "@/actions/ideas";
import { createDueItem } from "@/actions/dues";
import { createReview } from "@/actions/reviews";
import { nanoid } from "@/lib/id";

// --- QUERIES ---

export function useTasksQuery() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
}

export function useAreasQuery() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => getAreas(),
  });
}

export function useModulesQuery() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: () => getModules(),
  });
}

// --- MUTATIONS: TASKS ---

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTaskPayload: any) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => [
        {
          id: nanoid(),
          ...newTaskPayload,
          status: newTaskPayload.status || "inbox",
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTask(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) =>
        (old || []).map((task: any) => (task.id === id ? { ...task, ...payload } : task))
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => (old || []).filter((task: any) => task.id !== id));
      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// --- MUTATIONS: PROJECTS ---

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onMutate: async (newProjectPayload: any) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) => [
        {
          id: nanoid(),
          ...newProjectPayload,
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateProject(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) =>
        (old || []).map((project: any) => (project.id === id ? { ...project, ...payload } : project))
      );
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) => (old || []).filter((project: any) => project.id !== id));
      return { previousProjects };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// --- MUTATIONS: AREAS ---

export function useCreateAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArea,
    onMutate: async (newAreaPayload: any) => {
      await queryClient.cancelQueries({ queryKey: ["areas"] });
      const previousAreas = queryClient.getQueryData(["areas"]);
      queryClient.setQueryData(["areas"], (old: any) => [
        {
          id: nanoid(),
          ...newAreaPayload,
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      return { previousAreas };
    },
    onError: (err, newArea, context) => {
      queryClient.setQueryData(["areas"], context?.previousAreas);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useUpdateAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateArea(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["areas"] });
      const previousAreas = queryClient.getQueryData(["areas"]);
      queryClient.setQueryData(["areas"], (old: any) =>
        (old || []).map((area: any) => (area.id === id ? { ...area, ...payload } : area))
      );
      return { previousAreas };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["areas"], context?.previousAreas);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useDeleteAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArea,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["areas"] });
      const previousAreas = queryClient.getQueryData(["areas"]);
      queryClient.setQueryData(["areas"], (old: any) => (old || []).filter((area: any) => area.id !== id));
      return { previousAreas };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["areas"], context?.previousAreas);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

// --- MUTATIONS: MODULES ---

export function useCreateModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createModule,
    onMutate: async (newModulePayload: any) => {
      await queryClient.cancelQueries({ queryKey: ["modules"] });
      const previousModules = queryClient.getQueryData(["modules"]);
      queryClient.setQueryData(["modules"], (old: any) => [
        {
          id: nanoid(),
          ...newModulePayload,
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      return { previousModules };
    },
    onError: (err, newModule, context) => {
      queryClient.setQueryData(["modules"], context?.previousModules);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

export function useUpdateModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateModule(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["modules"] });
      const previousModules = queryClient.getQueryData(["modules"]);
      queryClient.setQueryData(["modules"], (old: any) =>
        (old || []).map((module: any) => (module.id === id ? { ...module, ...payload } : module))
      );
      return { previousModules };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["modules"], context?.previousModules);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

export function useDeleteModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteModule,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["modules"] });
      const previousModules = queryClient.getQueryData(["modules"]);
      queryClient.setQueryData(["modules"], (old: any) => (old || []).filter((module: any) => module.id !== id));
      return { previousModules };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["modules"], context?.previousModules);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

// ----------------------
// ASSETS
// ----------------------
export function useCreateAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createAsset(payload),
    onMutate: async (newAsset) => {
      // optimistic update logic omitted for brevity on secondary models since they might not be fetched yet
      return { previous: null };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });
}

// ----------------------
// IDEAS
// ----------------------
export function useCreateIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createIdea(payload),
    onMutate: async (newIdea) => {
      return { previous: null };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ideas"] })
  });
}

// ----------------------
// DUES
// ----------------------
export function useCreateDueItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createDueItem(payload),
    onMutate: async (newDue) => {
      return { previous: null };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["dues"] })
  });
}

// ----------------------
// REVIEWS
// ----------------------
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createReview(payload),
    onMutate: async (newReview) => {
      return { previous: null };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["reviews"] })
  });
}
