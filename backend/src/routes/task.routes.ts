import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
} from "../controllers/task.controller";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.patch("/:id", updateTask);

export default router;
