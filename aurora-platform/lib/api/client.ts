const API_URL = "/api/backend";

const getHeaders = (): Record<string, string> => {
  return {
    "Content-Type": "application/json",
  };
};

export const apiClient = {
  get: async <T>(
    url: string,
    config?: {
      params?: Record<string, string>;
    },
  ): Promise<{ data: T }> => {
    const query = config?.params
      ? "?" + new URLSearchParams(config.params).toString()
      : "";

    const response = await fetch(`${API_URL}${url}${query}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return {
      data,
    };
  },

  post: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return {
      data,
    };
  },

  patch: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return {
      data,
    };
  },

  delete: async <T>(url: string): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: T = await response.json();

    return {
      data,
    };
  },
};
