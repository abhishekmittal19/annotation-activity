"use client";

import { apiClient } from "./client";
import { AuthResponse, RegisterDTO } from "@/types/auth";
import { User } from "@/types/user";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      token: string;
      user: User;
    }>("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  register: async (payload: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );

    return response.data;
  },
};
