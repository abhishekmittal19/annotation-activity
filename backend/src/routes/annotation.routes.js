import { Router } from "express";
import {
  getAnnotations,
  getAnnotationById,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
} from "../controllers/annotation.controller";

const router = Router();

router.get("/tasks/:taskId/annotations", getAnnotations);

router.post("/tasks/:taskId/annotations", createAnnotation);

router.get("/annotations/:id", getAnnotationById);

router.patch("/annotations/:id", updateAnnotation);

router.delete("/annotations/:id", deleteAnnotation);

export default router;
