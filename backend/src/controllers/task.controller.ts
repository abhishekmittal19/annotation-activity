import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const service = new TaskService();

export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    const result = await service.getTasks(page, pageSize);

    res.json({
      page,
      pageSize,
      total: result.total,
      items: result.items.map((task) => ({
        id: task._id,
        title: task.title,
        type: task.type,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        annotationCount: task.annotationCount,
        updatedAt: task.updatedAt,
        meta: task.meta,
      })),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await service.getTask(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.json({
      id: task._id,
      title: task.title,
      type: task.type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      annotationCount: task.annotationCount,
      updatedAt: task.updatedAt,
      meta: task.meta,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await service.createTask(req.body);

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await service.updateTask(req.params.id, req.body);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.json(task);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
