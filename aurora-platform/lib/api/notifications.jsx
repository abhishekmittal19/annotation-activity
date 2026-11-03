import { apiClient } from "./client";

export const notificationsApi = {
  getAll: async () => {
    const response = await apiClient.get("/notifications");


    return response.data;
  },

  markAsRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all");
  },
};
