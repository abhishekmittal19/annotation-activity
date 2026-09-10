export interface UpdateTaskDto {
  title?: string;
  priority?: "low" | "medium" | "high";
  type?: "image" | "text" | "audio" | "video";
}
