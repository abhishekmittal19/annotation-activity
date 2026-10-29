import type { Request, Response } from "express";
import mongoose from "mongoose";
import { createDataset } from "../services/dataset.service";
import { Dataset } from "../models/dataset.model";
import { Project } from "../models/project.model";

export async function uploadDataset(req: any, res: Response) {
  console.log(res, "8");
  console.log("MULTER FILE:", req.file);
  console.log("CONTENT TYPE:", req.headers["content-type"]);
  try {
    const userId = req.user?.id;
    const projectId = req.params.projectId;
    const file = req.file;
    console.log(req.file, "13");

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (
      typeof projectId !== "string" ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please select a CSV or JSON file." });
    }

    const dataset = await createDataset(projectId, file, userId);

    return res.status(201).json({
      message: "Dataset uploaded successfully.",
      dataset,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload dataset.";

    const status = message.includes("not found or you do not have access")
      ? 404
      : 400;

    return res.status(status).json({ message });
  }
}

export async function getProjectDatasets(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const projectId = req.params.projectId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (
      typeof projectId !== "string" ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you do not have access to it.",
      });
    }

    const datasets = await Dataset.find({ projectId }).sort({ createdAt: -1 });

    return res.status(200).json({ datasets });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve datasets.",
    });
  }
}
