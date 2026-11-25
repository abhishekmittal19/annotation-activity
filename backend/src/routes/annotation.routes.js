const { Router } = require("express");

const {
  getAnnotations,
  getAnnotationById,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
} = require("../controllers/annotation.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = Router();

router.get("/tasks/:taskId/annotations", authenticate, getAnnotations);

router.post("/tasks/:taskId/annotations", authenticate, createAnnotation);

router.get("/annotations/:id", authenticate, getAnnotationById);

router.patch("/annotations/:id", authenticate, updateAnnotation);

router.delete("/annotations/:id", authenticate, deleteAnnotation);

module.exports = router;
