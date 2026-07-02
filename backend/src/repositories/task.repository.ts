import Task from "../models/Task";

export class TaskRepository {
  async findAll() {
    return Task.find().sort({ updatedAt: -1 });
  }

  async findById(id: string) {
    return Task.findById(id);
  }

  async create(data: any) {
    return Task.create(data);
  }

  async update(id: string, data: any) {
    return Task.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Task.findByIdAndDelete(id);
  }
}
