import { apiClient } from "./client";

export interface AuroraNotification {
  _id: string;
  userId: string;
  type:
    | "USER_REGISTERED"
    | "TASK_ASSIGNED"
    | "TASK_SUBMITTED"
    | "REVIEW_REQUIRED"
    | "TASK_APPROVED"
    | "TASK_REWORK_REQUIRED";
  title: string;
  message: string;
  taskId?: {
    _id: string;
    taskId: string;
    title: string;
  } | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: AuroraNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  getAll: async (): Promise<NotificationsResponse> => {
    const response =
      await apiClient.get<NotificationsResponse>("/notifications");

    // The backend response also contains unreadCount.
    // Fetch the full response shape instead of only the data array.
    return response.data ;
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all");
  },
};
