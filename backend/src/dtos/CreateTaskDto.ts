export type CreateTaskType = "image" | "text" | "audio" | "video";

export type CreateTaskStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "rework_required"
  | "completed";

export type CreateTaskPriority = "low" | "medium" | "high";

export interface CreateTaskDto {
  taskId?: string;

  title: string;

  type: CreateTaskType;

  status?: CreateTaskStatus;

  priority?: CreateTaskPriority;

  assignee?: string | null;

  annotationCount?: number;

  meta?: {
    source?: string;
    imageUrl?: string;
  };
}
