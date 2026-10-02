import Task from "../models/task.model";
import { CreateTaskDto } from "../dtos/CreateTaskDto";
import { UpdateTaskDto } from "../dtos/UpdateTaskDto";

export class TaskRepository {
  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const items = await Task.find()
      .populate("assignee", "name email role")
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: -1 });

    const total = await Task.countDocuments();

    return {
      items,
      total,
    };
  }

  async findById(id: string) {
    return Task.findById(id).populate("assignee", "name email role");
  }

  async create(data: CreateTaskDto) {
    return Task.create({
      taskId: data.taskId,
      title: data.title,
      type: data.type,
      status: data.status || "pending",
      priority: data.priority || "medium",
      assignee: data.assignee || null,
      annotationCount: data.annotationCount || 0,
      meta: data.meta || {},
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return Task.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("assignee", "name email role");
  }

  async delete(id: string) {
    return Task.findByIdAndDelete(id);
  }

  async findByAssignee(userId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const items = await Task.find({
      assignee: userId,
    })
      .populate("assignee", "name email role")
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: -1 });

    const total = await Task.countDocuments({
      assignee: userId,
    });

    return {
      items,
      total,
    };
  }
}
