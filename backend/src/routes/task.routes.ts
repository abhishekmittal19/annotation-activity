import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getMyTasks,
  submitTask,
} from "../controllers/task.controller";

const router = Router();

router.get("/", authenticate, getTasks);
router.get("/:id", authenticate, getTaskById);
router.post("/", authenticate, authorize("admin"), createTask);
router.patch("/:id", authenticate, authorize("admin"), updateTask);
router.delete("/:id", authenticate, authorize("admin"), deleteTask);
router.patch("/:id/assign", authenticate, authorize("admin"), assignTask);
router.patch("/:id/unassign", authenticate, authorize("admin"), unassignTask);
router.patch("/:id/submit", submitTask);
router.get(
  "/my",
  authenticate,
  authorize("annotator", "admin", "manager", "reviewer"),
  getMyTasks,
);
export default router;
