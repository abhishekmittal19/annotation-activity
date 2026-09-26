"use client";

import { apiClient } from "./client";
import { AuthResponse, RegisterDTO } from "@/types/auth";
import { User } from "@/types/user";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    return data;
  },

  register: async (payload: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );

    return response.data;
  },
};
