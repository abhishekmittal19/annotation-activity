// Create Task DTO

/**
 * Expected structure:
 *
 * {
 *   taskId: string,
 *   title: string,
 *   type: "image" | "text" | "audio" | "video",
 *   status: "pending" | "assigned" | "in_progress" |
 *           "submitted" | "under_review" | "approved" |
 *           "rejected" | "rework_required" | "completed",
 *   priority: "low" | "medium" | "high",
 *   assignee: string | null,
 *   annotationCount: number,
 *   meta: {
 *     source: string,
 *     imageUrl: string
 *   }
 * }
 */
