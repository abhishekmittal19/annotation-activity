export const analyticsApi = {
  getDashboardMetrics: async () => {
    const response = await fetch("/api/backend/analytics/dashboard", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const responseText = await response.text();

    console.log("Analytics Status:", response.status);
    console.log("Analytics Response:", responseText);

    if (!response.ok) {
      throw new Error(
        `Analytics API failed: ${response.status} - ${responseText}`,
      );
    }

    const result = JSON.parse(responseText);
    return result.data;
  },
};
