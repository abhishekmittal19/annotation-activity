import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const service = new TaskService();

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await service.getTasks();

      return res.json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}
