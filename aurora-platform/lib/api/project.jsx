import { apiClient } from "./client";

export const projectApi = {
  create: async (payload) => {
    const response = await apiClient.post("/projects", payload);

    return response.data.project;
  },

  getMyProjects: async () => {
    const response = await apiClient.get("/projects");
    return response.data.projects;
  },
};
