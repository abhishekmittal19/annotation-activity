import { apiClient } from "./client";

export type ProjectTaskType =
  | "text-classification"
  | "image-annotation"
  | "text-annotation";

export type ProjectStatus = "draft" | "active" | "completed";

export interface Project {
  _id: string;
  name: string;
  description: string;
  taskType: ProjectTaskType;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProjectPayload {
  name: string;
  description?: string;
  taskType: ProjectTaskType;
}

interface CreateProjectResponse {
  message: string;
  project: Project;
}

interface GetProjectsResponse {
  projects: Project[];
}

export const projectApi = {
  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await apiClient.post<CreateProjectResponse>(
      "/projects",
      payload,
    );

    return response.data.project;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<GetProjectsResponse>("/projects");

    return response.data.projects;
  },
};
