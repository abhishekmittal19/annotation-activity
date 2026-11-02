"use client";

import { apiClient } from "./client";

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get("/users");

    return response.data;
  },
};
