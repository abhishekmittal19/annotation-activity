"use client";

import { apiClient } from "./client";
import { MOCK_TASKS } from "./mockData";

const localTasksState = [...MOCK_TASKS];

export const tasksApi = {
  getTasks: async (params) => {
    try {
      const response = await apiClient.get("/tasks", {
        params: Object.fromEntries(
          Object.entries(params ?? {}).map(([key, value]) => [
            key,
            String(value),
          ]),
        ),
      });

      return response.data;
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

      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 20;

      return {
        page,
        pageSize,
        total: filtered.length,
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
      };
    }
  },

  getTaskById: async (id) => {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch {
      const found = localTasksState.find((t) => t.id === id);

      if (!found) {
        return localTasksState[0];
      }

      return found;
    }
  },

  updateTask: async (id, dto) => {
    const response = await apiClient.patch(`/tasks/${id}`, dto);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  assignTask: async (id, assigneeId) => {
    const response = await apiClient.patch(`/tasks/${id}/assign`, {
      assignee: assigneeId,
    });

    return response.data;
  },

  unassignTask: async (id) => {
    const response = await apiClient.patch(`/tasks/${id}/unassign`);
    return response.data;
  },

  createTask: async (task) => {
    const response = await apiClient.post("/tasks", {
      title: task.title,
      type: task.type,
      priority: task.priority,
      status: "pending",
      annotationCount: 0,
      meta: task.meta,
    });

    return response.data;
  },

  saveTaskDraft: async (id, annotations, timeSpent) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/draft`, {
        annotations,
        timeSpent,
      });

      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);

      if (idx !== -1) {
        localTasksState[idx] = {
          ...localTasksState[idx],
          annotations,
          timeSpentSeconds: timeSpent,
          status:
            localTasksState[idx].status === "ASSIGNED"
              ? "IN_PROGRESS"
              : localTasksState[idx].status,
        };

        return localTasksState[idx];
      }

      throw new Error("Task not found");
    }
  },

  submitTask: async (id, annotations, timeSpent) => {
    try {
      const response = await apiClient.post(`/tasks/${id}/submit`, {
        annotations,
        timeSpent,
      });

      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);

      if (idx !== -1) {
        const task = localTasksState[idx];

        const updated = {
          ...task,
          annotations,
          timeSpentSeconds: timeSpent,
          status: "SUBMITTED",
          submittedAt: new Date().toISOString(),
          activityHistory: [
            ...task.activityHistory,
            {
              id: `act-${Date.now()}`,
              taskId: task.id,
              actor: {
                id: task.assigneeId || "user-1",
                name: task.assigneeName || "Alex Rivera",
                role: "ANNOTATOR",
              },
              action: task.revisionVersion > 1 ? "RESUBMITTED" : "SUBMITTED",
              timestamp: new Date().toISOString(),
              details: `Submitted Revision v${task.revisionVersion} with ${annotations.length} annotations`,
              revisionVersion: task.revisionVersion,
            },
          ],
        };

        localTasksState[idx] = updated;
        return updated;
      }

      throw new Error("Task not found");
    }
  },

  reviewTask: async (id, action, payload) => {
    try {
      const response = await apiClient.post(`/tasks/${id}/review`, {
        action,
        ...payload,
      });

      return response.data;
    } catch {
      const idx = localTasksState.findIndex((t) => t.id === id);

      if (idx !== -1) {
        const task = localTasksState[idx];

        const newStatus = action === "APPROVE" ? "APPROVED" : "REWORK_REQUIRED";

        const nextRevisionVersion =
          action === "REJECT" ? task.revisionVersion + 1 : task.revisionVersion;

        const updated = {
          ...task,
          status: newStatus,
          reviewedAt: new Date().toISOString(),
          completedAt:
            action === "APPROVE" ? new Date().toISOString() : undefined,
          revisionVersion: nextRevisionVersion,
          activityHistory: [
            ...task.activityHistory,
            {
              id: `act-${Date.now()}`,
              taskId: task.id,
              actor: {
                id: "user-reviewer-1",
                name: "Elena Rostova",
                role: "REVIEWER",
              },
              action: action === "APPROVE" ? "APPROVED" : "REJECTED",
              timestamp: new Date().toISOString(),
              details:
                action === "APPROVE"
                  ? `Approved annotation with ${payload.rating || 5}/5 stars quality rating`
                  : `Rejected Revision v${task.revisionVersion}. Reason: ${payload.rejectionReason}`,
              revisionVersion: task.revisionVersion,
            },
          ],
        };

        localTasksState[idx] = updated;
        return updated;
      }

      throw new Error("Task not found");
    }
  },
};
