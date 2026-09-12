export interface UpdateTaskDto {
  title?: string;
  priority?: "low" | "medium" | "high";
  type?: "image" | "text" | "audio" | "video";
  status?:
    | "pending"
    | "assigned"
    | "in_progress"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "rework_required"
    | "completed";
}
