import { apiClient } from "./client";

export const datasetApi = {
  upload: async (projectId, file) => {
    const formData = new FormData();
    console.log(formData);
    formData.append("file", file);

    const response = await apiClient.post(
      `/datasets/projects/${projectId}/datasets`,
      formData,
    );

    return response.data.dataset;
  },

  getByProject: async (projectId) => {
    const response = await apiClient.get(
      `/datasets/projects/${projectId}/datasets`,
    );

    return response.data.datasets;
  },
};
