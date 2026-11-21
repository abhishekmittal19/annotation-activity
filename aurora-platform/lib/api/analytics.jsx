import { api } from "./axios";

export const analyticsApi = {
  getDashboardMetrics: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data.data;
  },
};
