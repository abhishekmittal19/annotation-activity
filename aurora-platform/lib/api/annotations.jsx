"use client";

import { apiClient } from "./client";

export const annotationsApi = {
  getByTask: async (taskId) => {
    const response = await apiClient.get(`/tasks/${taskId}/annotations`);

    return response.data;
  },

  create: async (taskId, dto) => {
    const response = await apiClient.post(`/tasks/${taskId}/annotations`, dto);

    return response.data;
  },

  update: async (id, dto) => {
    const response = await apiClient.patch(`/annotations/${id}`, dto);

    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/annotations/${id}`);

    return response.data;
  },
};
