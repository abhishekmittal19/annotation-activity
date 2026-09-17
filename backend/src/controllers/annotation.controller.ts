import { Request, Response } from "express";
import annotationService from "../services/annotation.service";

export const getAnnotations = async (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.taskId);

    const annotations = await annotationService.getAnnotations(taskId);

    res.json(annotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAnnotationById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const annotation = await annotationService.getAnnotationById(id);

    if (!annotation) {
      return res.status(404).json({
        message: "Annotation not found",
      });
    }

    res.json(annotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createAnnotation = async (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.taskId);

    const { annotator, type, label, data, confidence } = req.body;

    if (!annotator || !type || !label || !data) {
      return res.status(400).json({
        message: "annotator, type, label and data are required",
      });
    }

    const annotation = await annotationService.createAnnotation({
      task: taskId,
      annotator,
      type,
      label,
      data,
      confidence,
    });

    res.status(201).json(annotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateAnnotation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const annotation = await annotationService.updateAnnotation(id, req.body);

    if (!annotation) {
      return res.status(404).json({
        message: "Annotation not found",
      });
    }

    res.json(annotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteAnnotation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const annotation = await annotationService.deleteAnnotation(id);

    if (!annotation) {
      return res.status(404).json({
        message: "Annotation not found",
      });
    }

    res.json({
      success: true,
      message: "Annotation deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
