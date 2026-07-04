import { TaskRepository } from "../repositories/task.repository";

export class TaskService {
  private repository = new TaskRepository();

  async getTasks(page: number, pageSize: number) {
    return this.repository.findAll(page, pageSize);
  }

  async getTask(id: string) {
    return this.repository.findById(id);
  }

  async createTask(data: any) {
    return this.repository.create(data);
  }

  async updateTask(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async deleteTask(id: string) {
    return this.repository.delete(id);
  }
}
