const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = {
  get: async <T>(
    url: string,
    config?: { params?: Record<string, string> },
  ): Promise<{ data: T }> => {
    const query = config?.params
      ? "?" + new URLSearchParams(config.params).toString()
      : "";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("aurora_token")
        : null;

    const response = await fetch(`${API_URL}${url}${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },

  post: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("aurora_token")
        : null;

    const response = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },

  patch: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("aurora_token")
        : null;

    const response = await fetch(`${API_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },
};
