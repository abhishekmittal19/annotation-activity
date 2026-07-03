import { Request, Response } from "express";
import Task from "../models/Task";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;

    const pageSize = Number(req.query.pageSize) || 20;

    const skip = (page - 1) * pageSize;

    const total = await Task.countDocuments();

    const tasks = await Task.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      page,
      pageSize,
      total,
      items: tasks.map((task) => ({
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
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
