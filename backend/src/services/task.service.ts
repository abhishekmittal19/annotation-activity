import { TaskRepository } from "../repositories/task.repository";

export class TaskService {
  private repository = new TaskRepository();

  getTasks() {
    return this.repository.findAll();
  }

  getTask(id: string) {
    return this.repository.findById(id);
  }

  createTask(data: any) {
    return this.repository.create(data);
  }

  updateTask(id: string, data: any) {
    return this.repository.update(id, data);
  }

  deleteTask(id: string) {
    return this.repository.delete(id);
  }
}
