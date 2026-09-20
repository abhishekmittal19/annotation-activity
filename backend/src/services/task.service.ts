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
    return this.repository.create(data);
  }

  async updateTask(id: string, data: any) {
    const task = await this.repository.update(id, data);

    if (!task) {
      return null;
    }

    return task;
  }

  async deleteTask(id: string) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new Error("Task not found");
    }

    return this.repository.delete(id);
  }

  // ==============================
  // Assign Task
  // ==============================
  async assignTask(taskId: string, assigneeId: string) {
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    const user = await this.userRepository.findById(assigneeId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "annotator") {
      throw new Error("Only annotators can be assigned tasks");
    }

    return this.repository.assignTask(taskId, assigneeId);
  }

  // ==============================
  // Remove Assignment
  // ==============================
  async unassignTask(taskId: string) {
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    return this.repository.unassignTask(taskId);
  }

  // ==============================
  // Get My Tasks
  // ==============================
  async getMyTasks(userId: string) {
    return this.repository.findByAssignee(userId);
  }
  async submitTask(id: string) {
    return this.repository.update(id, {
      status: "submitted",
    });
  }
}
