'use client';

import { apiClient } from './client';
import { TaskItem, TaskStatus, AnnotationObject, TaskPriority } from '@/types/task';
import { MOCK_TASKS } from './mockData';

let localTasksState = [...MOCK_TASKS];

export interface CreateTaskDTO {
  title: string;
  datasetName: string;  
  imageUrl: string;
  priority: TaskPriority;
  assigneeId?: string;
}

export const tasksApi = {
  getTasks: async (params?: { status?: TaskStatus; assigneeId?: string; reviewerId?: string }): Promise<TaskItem[]> => {
    try {
      const response = await apiClient.get<TaskItem[]>('/tasks', { params });
      return response.data.items;
    } catch {
      let filtered = [...localTasksState];
      if (params?.status) {
        filtered = filtered.filter((t) => t.status === params.status);
      }
      if (params?.assigneeId) {
        filtered = filtered.filter((t) => t.assigneeId === params.assigneeId);
      }
      if (params?.reviewerId) {
        filtered = filtered.filter((t) => t.reviewerId === params.reviewerId);
      }
      return filtered;
    }
  },

  getTaskById: async (id: string): Promise<TaskItem> => {
    try {
      const response = await apiClient.get<TaskItem>(`/tasks/${id}`);
      return response.data;
    } catch {
      const found = localTasksState.find((t) => t.id === id);
      if (!found) {
        return localTasksState[0];
      }
      return found;
    }
  },

  createTask: async (dto: CreateTaskDTO): Promise<TaskItem> => {
    try {
      const response = await apiClient.post<TaskItem>('/tasks', dto);
      return response.data;
    } catch {
      const newTask: TaskItem = {
        id: `AUR-${Math.floor(10000 + Math.random() * 90000)}`,
        title: dto.title,
        datasetName: dto.datasetName,
        imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1200&q=80',
        type: 'IMAGE_BOUNDING_BOX',
        priority: dto.priority,
        status: dto.assigneeId ? 'ASSIGNED' : 'PENDING',
        assigneeId: dto.assigneeId,
        assigneeName: dto.assigneeId ? 'Alex Rivera' : undefined,
        revisionVersion: 1,
        createdAt: new Date().toISOString(),
        assignedAt: dto.assigneeId ? new Date().toISOString() : undefined,
        slaDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        timeSpentSeconds: 0,
        annotations: [],
        revisions: [],
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            taskId: `AUR-NEW`,
            actor: { id: 'admin-1', name: 'Sarah Connor', role: 'ADMIN' },
            action: 'CREATED',
            timestamp: new Date().toISOString(),
            details: 'Task created via Task Management Wizard',
          },
        ],
      };
      localTasksState.unshift(newTask);
      return newTask;
    }
  },

  saveTaskDraft: async (id: string, annotations: AnnotationObject[], timeSpent: number): Promise<TaskItem> => {
    try {
      const response = await apiClient.patch<TaskItem>(`/tasks/${id}/draft`, { annotations, timeSpent });
      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);
      if (idx !== -1) {
        localTasksState[idx] = {
          ...localTasksState[idx],
          annotations,
          timeSpentSeconds: timeSpent,
          status: localTasksState[idx].status === 'ASSIGNED' ? 'IN_PROGRESS' : localTasksState[idx].status,
        };
        return localTasksState[idx];
      }
      throw new Error('Task not found');
    }
  },

  submitTask: async (id: string, annotations: AnnotationObject[], timeSpent: number): Promise<TaskItem> => {
    try {
      const response = await apiClient.post<TaskItem>(`/tasks/${id}/submit`, { annotations, timeSpent });
      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const task = localTasksState[idx];
        const updated: TaskItem = {
          ...task,
          annotations,
          timeSpentSeconds: timeSpent,
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
          activityHistory: [
            ...task.activityHistory,
            {
              id: `act-${Date.now()}`,
              taskId: task.id,
              actor: { id: task.assigneeId || 'user-1', name: task.assigneeName || 'Alex Rivera', role: 'ANNOTATOR' },
              action: task.revisionVersion > 1 ? 'RESUBMITTED' : 'SUBMITTED',
              timestamp: new Date().toISOString(),
              details: `Submitted Revision v${task.revisionVersion} with ${annotations.length} annotations`,
              revisionVersion: task.revisionVersion,
            },
          ],
        };
        localTasksState[idx] = updated;
        return updated;
      }
      throw new Error('Task not found');
    }
  },

  reviewTask: async (
    id: string,
    action: 'APPROVE' | 'REJECT',
    payload: {
      rating?: number;
      rejectionReason?: string;
      severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
      feedback?: string;
      requiredCorrections?: string[];
    }
  ): Promise<TaskItem> => {
    try {
      const response = await apiClient.post<TaskItem>(`/tasks/${id}/review`, { action, ...payload });
      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const task = localTasksState[idx];
        const newStatus: TaskStatus = action === 'APPROVE' ? 'APPROVED' : 'REWORK_REQUIRED';
        const nextRevisionVersion = action === 'REJECT' ? task.revisionVersion + 1 : task.revisionVersion;

        const updated: TaskItem = {
          ...task,
          status: newStatus,
          reviewedAt: new Date().toISOString(),
          completedAt: action === 'APPROVE' ? new Date().toISOString() : undefined,
          revisionVersion: nextRevisionVersion,
          activityHistory: [
            ...task.activityHistory,
            {
              id: `act-${Date.now()}`,
              taskId: task.id,
              actor: { id: 'user-reviewer-1', name: 'Elena Rostova', role: 'REVIEWER' },
              action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
              timestamp: new Date().toISOString(),
              details: action === 'APPROVE'
                ? `Approved annotation with ${payload.rating || 5}/5 stars quality rating`
                : `Rejected Revision v${task.revisionVersion}. Reason: ${payload.rejectionReason}`,
              revisionVersion: task.revisionVersion,
            },
          ],
        };
        localTasksState[idx] = updated;
        return updated;
      }
      throw new Error('Task not found');
    }
  },
};
