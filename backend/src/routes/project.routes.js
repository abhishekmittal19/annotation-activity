import { Router } from "express";
import {
  createProject,
  getMyProjects,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createProject);
router.get("/", authenticate, getMyProjects);

export default router;
