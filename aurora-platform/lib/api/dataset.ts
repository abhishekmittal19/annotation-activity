import { apiClient } from "./client";

export interface Dataset {
  _id: string;
  name: string;
  projectId: string;
  fileType: "csv" | "json" | "txt";
  originalFileName: string;
  records: Record<string, unknown>[];
  recordCount: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadDatasetResponse {
  message: string;
  dataset: Dataset;
}

interface GetDatasetsResponse {
  datasets: Dataset[];
}

export const datasetApi = {
  upload: async (projectId: string, file: File): Promise<Dataset> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadDatasetResponse>(
      `/datasets/projects/${projectId}/datasets`,
      formData,
    );

    return response.data.dataset;
  },

  getByProject: async (projectId: string): Promise<Dataset[]> => {
    const response = await apiClient.get<GetDatasetsResponse>(
      `/datasets/projects/${projectId}/datasets`,
    );

    return response.data.datasets;
  },
};
