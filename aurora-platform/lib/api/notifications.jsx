import { apiClient } from "./client";

export const notificationsApi = {
  getAll: async () => {
    const response = await apiClient.get("/notifications");

    // The backend response also contains unreadCount.
    // Fetch the full response shape instead of only the data array.
    return response.data;
  },

  markAsRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all");
  },
};
