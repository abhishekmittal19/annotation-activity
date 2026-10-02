import { TaskRepository } from "../repositories/task.repository";
import { UserRepository } from "../repositories/user.repository";
import { CreateTaskDto } from "../dtos/CreateTaskDto";
import { UpdateTaskDto } from "../dtos/UpdateTaskDto";

export class TaskService {
  private repository = new TaskRepository();
  private userRepository = new UserRepository();

  async getTasks(page: number, pageSize: number) {
    return this.repository.findAll(page, pageSize);
  }

  async getTask(id: string) {
    return this.repository.findById(id);
  }

  async createTask(data: CreateTaskDto) {
    const taskId =
      data.taskId ||
      `TASK-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const taskData: CreateTaskDto = {
      ...data,
      taskId,
      status: data.status || "pending",
      priority: data.priority || "medium",
      annotationCount: data.annotationCount || 0,
      assignee: data.assignee || null,
    };

    return this.repository.create(taskData);
  }

  async updateTask(id: string, data: UpdateTaskDto) {
    const task = await this.repository.update(id, data);

    if (!task) {
      return null;
    }

    return task;
  }

  async deleteTask(id: string) {
    return this.repository.delete(id);
  }

  async assignTask(id: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return this.repository.update(id, {
      assignee: user._id.toString(),
      status: "assigned",
    });
  }

  async unassignTask(id: string) {
    return this.repository.update(id, {
      assignee: null,
      status: "pending",
    });
  }

  async getMyTasks(userId: string, page = 1, pageSize = 20) {
    return this.repository.findByAssignee(userId, page, pageSize);
  }

  async submitTask(id: string) {
    const task = await this.repository.update(id, {
      status: "submitted",
    });

    if (!task) {
      return null;
    }

    return task;
  }
}
