"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { getProjects, createProject, updateProject, deleteProject } from "@/actions/projects";
import { getAreas, createArea, updateArea, deleteArea } from "@/actions/areas";
import { getModules, createModule, updateModule, deleteModule } from "@/actions/modules";
import { createAsset } from "@/actions/assets";
import { createIdea } from "@/actions/ideas";
import { nanoid } from "@/lib/id";

export function useTasksQuery() {
  return useQuery({ queryKey: ["tasks"], queryFn: () => getTasks() });
}

export function useProjectsQuery() {
  return useQuery({ queryKey: ["projects"], queryFn: () => getProjects() });
}

export function useAreasQuery() {
  return useQuery({ queryKey: ["areas"], queryFn: () => getAreas() });
}

export function useModulesQuery() {
  return useQuery({ queryKey: ["modules"], queryFn: () => getModules() });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => [{ id: nanoid(), ...payload, status: payload.status || "inbox", createdAt: new Date().toISOString() }, ...(old || [])]);
      return { previous };
    },
    onError: (_error, _payload, context) => queryClient.setQueryData(["tasks"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTask(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => (old || []).map((task: any) => task.id === id ? { ...task, ...payload } : task));
      return { previous };
    },
    onError: (_error, _payload, context) => queryClient.setQueryData(["tasks"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => (old || []).filter((task: any) => task.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(["tasks"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) => [{ id: nanoid(), ...payload, createdAt: new Date().toISOString() }, ...(old || [])]);
      return { previous };
    },
    onError: (_error, _payload, context) => queryClient.setQueryData(["projects"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateProject(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) => (old || []).map((project: any) => project.id === id ? { ...project, ...payload } : project));
      return { previous };
    },
    onError: (_error, _payload, context) => queryClient.setQueryData(["projects"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old: any) => (old || []).filter((project: any) => project.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(["projects"], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

function simpleCreateMutation<T>(queryKey: string[], mutationFn: (payload: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSettled: () => queryClient.invalidateQueries({ queryKey }) });
}

export function useCreateAreaMutation() { return simpleCreateMutation(["areas"], createArea); }
export function useUpdateAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => updateArea(id, payload), onSettled: () => queryClient.invalidateQueries({ queryKey: ["areas"] }) });
}
export function useDeleteAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteArea, onSettled: () => queryClient.invalidateQueries({ queryKey: ["areas"] }) });
}

export function useCreateModuleMutation() { return simpleCreateMutation(["modules"], createModule); }
export function useUpdateModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => updateModule(id, payload), onSettled: () => queryClient.invalidateQueries({ queryKey: ["modules"] }) });
}
export function useDeleteModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteModule, onSettled: () => queryClient.invalidateQueries({ queryKey: ["modules"] }) });
}

export function useCreateAssetMutation() { return simpleCreateMutation(["assets"], createAsset); }
export function useCreateIdeaMutation() { return simpleCreateMutation(["ideas"], createIdea); }
