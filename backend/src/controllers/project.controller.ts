import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const service = new ProjectService();

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const project = await service.createProject(
      {
        name: req.body.name,
        description: req.body.description,
        taskType: req.body.taskType,
      },
      userId,
    );

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error: any) {
    if (
      error.message === "Project name is required" ||
      error.message === "Please select a valid annotation type"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("CREATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Unable to create project",
    });
  }
};

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const projects = await service.getMyProjects(userId);

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Unable to retrieve projects",
    });
  }
};
