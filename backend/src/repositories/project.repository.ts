import { Project } from "../models/project.model";

export class ProjectRepository {
  async create(data: {
    name: string;
    description?: string;
    taskType: string;
    createdBy: string;
  }) {
    return Project.create(data);
  }

  async findById(id: string) {
    return Project.findById(id);
  }

  async findByCreator(createdBy: string) {
    return Project.find({ createdBy }).sort({ createdAt: -1 });
  }

  async findAll() {
    return Project.find().sort({ createdAt: -1 });
  }
}
