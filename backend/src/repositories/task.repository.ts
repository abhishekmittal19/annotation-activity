import Task, { ITask } from "../models/task.model";
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

    return { items, total };
  }

  async findById(id: string) {
    return Task.findById(id).populate("assignee", "name email role");
  }

  async create(data: CreateTaskDto) {
    return Task.create(data);
  }

  async update(id: string, data: UpdateTaskDto) {
    return Task.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("assignee", "name email role");
  }

  async delete(id: string) {
    return Task.findByIdAndDelete(id);
  }

  // ✅ NEW: Assign task to a user
  async assignTask(taskId: string, assigneeId: string) {
    return Task.findByIdAndUpdate(
      taskId,
      {
        assignee: assigneeId,
      },
      {
        new: true,
      },
    ).populate("assignee", "name email role");
  }

  // ✅ NEW: Remove assignment
  async unassignTask(taskId: string) {
    return Task.findByIdAndUpdate(
      taskId,
      {
        assignee: null,
      },
      {
        new: true,
      },
    );
  }

  // ✅ NEW: Get tasks assigned to a user
  async findByAssignee(userId: string) {
    return Task.find({
      assignee: userId,
    }).populate("assignee", "name email role");
  }
}
