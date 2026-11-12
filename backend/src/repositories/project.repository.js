import { Project } from "../models/project.model";

export class ProjectRepository {
  async create(data) {
    console.log(data) 
    return Project.create(data);
  }

  async findById(id) {
    return Project.findById(id);
  }

  async findByCreator(createdBy) {
    return Project.find({ createdBy }).sort({ createdAt: -1 });
  }

  async findAll() {
    return Project.find().sort({ createdAt: -1 });
  }
}
