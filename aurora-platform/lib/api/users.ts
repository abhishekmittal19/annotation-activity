"use client";

import { apiClient } from "./client";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");

    return response.data;
  },
};
