import { TaskRepository } from "../repositories/task.repository";
import { CreateTaskDto } from "../dtos/CreateTaskDto";

export class TaskService {
  private repository = new TaskRepository();

  async getTasks(page: number, pageSize: number) {
    return this.repository.findAll(page, pageSize);
  }

  async getTask(id: string) {
    return this.repository.findById(id);
  }

  async createTask(data: CreateTaskDto) {
    return this.repository.create(data);
  }

  async updateTask(id: string, data: Partial<CreateTaskDto>) {
    return this.repository.update(id, data);
  }

  async deleteTask(id: string) {
    return this.repository.delete(id);
  }
}
