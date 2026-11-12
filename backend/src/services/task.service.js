const { TaskRepository } = require("../repositories/task.repository");
const { UserRepository } = require("../repositories/user.repository");
const { NotificationService } = require("./notification.service");

class TaskService {
  #repository = new TaskRepository();
  #userRepository = new UserRepository();
  #notificationService = new NotificationService();

  async getTasks(page, pageSize) {
    return this.#repository.findAll(page, pageSize);
  }

  async getTask(id) {
    return this.#repository.findById(id);
  }

  async createTask(data) {
    const taskId =
      data.taskId ||
      `TASK-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const taskData = {
      ...data,
      taskId,
      status: data.status || "pending",
      priority: data.priority || "medium",
      annotationCount: data.annotationCount || 0,
      assignee: data.assignee || null,
    };

    return this.#repository.create(taskData);
  }

  async updateTask(id, data) {
    const task = await this.#repository.update(id, data);

    if (!task) {
      return null;
    }

    return task;
  }

  async deleteTask(id) {
    return this.#repository.delete(id);
  }

  async assignTask(id, userId) {
    const user = await this.#userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const task = await this.#repository.update(id, {
      assignee: user._id.toString(),
      status: "assigned",
    });

    if (!task) {
      return null;
    }

    await this.#notificationService.createNotification({
      userId: user._id.toString(),
      type: "TASK_ASSIGNED",
      title: "New task assigned",
      message: `You have been assigned task ${task.taskId}.`,
      taskId: id,
    });

    return task;
  }

  async unassignTask(id) {
    return this.#repository.update(id, {
      assignee: null,
      status: "pending",
    });
  }

  async getMyTasks(userId, page = 1, pageSize = 20) {
    return this.#repository.findByAssignee(userId, page, pageSize);
  }

  async submitTask(id) {
    const task = await this.#repository.update(id, {
      status: "submitted",
    });

    if (!task) {
      return null;
    }

    return task;
  }
}

module.exports = { TaskService };
