"use client";

import { apiClient } from "./client";

export interface AnnotationData {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: Array<{
    x: number;
    y: number;
  }>;
  value?: string;
}

export type AnnotationType =
  | "bounding_box"
  | "polygon"
  | "classification"
  | "keypoint";

export interface AnnotationRecord {
  _id: string;
  task: string;
  annotator:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  type: AnnotationType;
  label: string;
  data: AnnotationData;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnotationDTO {
  annotator: string;
  type: AnnotationType;
  label: string;
  data: AnnotationData;
  confidence?: number;
}

export interface UpdateAnnotationDTO {
  label?: string;
  type?: AnnotationType;
  data?: AnnotationData;
  confidence?: number;
}

export const annotationsApi = {
  getByTask: async (taskId: string): Promise<AnnotationRecord[]> => {
    const response = await apiClient.get<AnnotationRecord[]>(
      `/tasks/${taskId}/annotations`,
    );

    return response.data;
  },

  create: async (
    taskId: string,
    dto: CreateAnnotationDTO,
  ): Promise<AnnotationRecord> => {
    const response = await apiClient.post<AnnotationRecord>(
      `/tasks/${taskId}/annotations`,
      dto,
    );

    return response.data;
  },

  update: async (
    id: string,
    dto: UpdateAnnotationDTO,
  ): Promise<AnnotationRecord> => {
    const response = await apiClient.patch<AnnotationRecord>(
      `/annotations/${id}`,
      dto,
    );

    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(
      `/annotations/${id}`,
    );

    return response.data;
  },
};
