export interface CreateTaskDto {
  title: string;
  type: "image" | "text" | "audio" | "video";
  status?: "pending" | "assigned" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  assignee?: {
    id: string;
    name: string;
  };
  annotationCount?: number;
  meta?: Record<string, unknown>;
}
