import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware";
import {
  uploadDataset,
  getProjectDatasets,
} from "../controllers/dataset.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

router.post(
  "/projects/:projectId/datasets",
  authenticate,
  upload.single("file"),
  uploadDataset,
);

router.get("/projects/:projectId/datasets", authenticate, getProjectDatasets);

export default router;
