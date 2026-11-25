const mongoose = require("mongoose");
const annotationService = require("../services/annotation.service");

const getAnnotations = async (req, res) => {
  try {
    const taskId = String(req.params.taskId);
    const annotations = await annotationService.getAnnotations(taskId);

    return res.status(200).json(annotations);
  } catch (error) {
    console.error("Get annotations error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAnnotationById = async (req, res) => {
  try {
    const annotation = await annotationService.getAnnotationById(
      String(req.params.id),
    );

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    return res.status(200).json(annotation);
  } catch (error) {
    console.error("Get annotation error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const createAnnotation = async (req, res) => {
  try {
    const taskId = String(req.params.taskId);
    const { type, label, data, confidence } = req.body;

    if (!type || !label || data == null) {
      return res.status(400).json({
        message: "type, label and data are required",
      });
    }

    const annotatorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(annotatorId)) {
      return res.status(400).json({
        message: "A real registered user is required to create annotations",
      });
    }

    const annotation = await annotationService.createAnnotation({
      task: taskId,
      annotator: annotatorId,
      type,
      label,
      data,
      confidence,
    });

    return res.status(201).json(annotation);
  } catch (error) {
    console.error("Create annotation error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateAnnotation = async (req, res) => {
  try {
    const annotation = await annotationService.updateAnnotation(
      String(req.params.id),
      req.body,
    );

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    return res.status(200).json(annotation);
  } catch (error) {
    console.error("Update annotation error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteAnnotation = async (req, res) => {
  try {
    const annotation = await annotationService.deleteAnnotation(
      String(req.params.id),
    );

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Annotation deleted",
    });
  } catch (error) {
    console.error("Delete annotation error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAnnotations,
  getAnnotationById,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
};
