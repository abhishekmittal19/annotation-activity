import Task from "../models/Task";
import { CreateTaskDto } from "../dtos/CreateTaskDto";

export class TaskRepository {
  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      Task.find().sort({ updatedAt: -1 }).skip(skip).limit(pageSize),

      Task.countDocuments(),
    ]);

    return {
      items,
      total,
    };
  }

  async findById(id: string) {
    return Task.findById(id);
  }

  async create(data: CreateTaskDto) {
    return Task.create(data);
  }

  async update(id: string, data: Partial<CreateTaskDto>) {
    return Task.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Task.findByIdAndDelete(id);
  }
}

