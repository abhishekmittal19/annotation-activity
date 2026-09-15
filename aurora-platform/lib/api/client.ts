const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aurora_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiClient = {
  get: async <T>(
    url: string,
    config?: { params?: Record<string, string> },
  ): Promise<{ data: T }> => {
    const query = config?.params
      ? "?" + new URLSearchParams(config.params).toString()
      : "";

    const response = await fetch(`${API_URL}${url}${query}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },

  post: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },

  patch: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },

  delete: async <T>(url: string): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return { data };
  },
};
