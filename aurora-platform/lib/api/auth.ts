"use client";

import { apiClient } from "./client";
import { AuthResponse, LoginDTO, RegisterDTO } from "@/types/auth";

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

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
