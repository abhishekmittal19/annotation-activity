import { ProjectRepository } from "../repositories/project.repository";

const VALID_TASK_TYPES = [
  "text-classification",
  "image-annotation",
  "text-annotation",
];

export class ProjectService {
  private repository = new ProjectRepository();

  async createProject(
    data: {
      name: string;
      description?: string;
      taskType: string;
    },
    userId: string,
  ) {
    const name = data.name?.trim();

    if (!name) {
      throw new Error("Project name is required");
    }

    if (!VALID_TASK_TYPES.includes(data.taskType)) {
      throw new Error("Please select a valid annotation type");
    }

    return this.repository.create({
      name,
      description: data.description?.trim() || "",
      taskType: data.taskType,
      createdBy: userId,
    });
  }

  async getMyProjects(userId: string) {
    return this.repository.findByCreator(userId);
  }
}
