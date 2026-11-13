import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
});

// Automatically attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aurora_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const apiClient = {
  get: async (url, config) => {
    const response = await axiosInstance.get(url, {
      params: config?.params,
    });

    return { data: response.data };
  },

  post: async (url, body) => {
    try {
      const response = await axiosInstance.post(url, body);
      return { data: response.data };
    } catch (error) {
      console.error("API POST FAILED:", {
        url,
        status: error.response?.status,
        response: error.response?.data,
      });

      throw error;
    }
  },

  patch: async (url, body) => {
    const response = await axiosInstance.patch(url, body);
    return { data: response.data };
  },

  delete: async (url) => {
    const response = await axiosInstance.delete(url);
    return { data: response.data };
  },
};
