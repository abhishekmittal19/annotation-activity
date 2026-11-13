const { Router } = require("express");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getMyTasks,
  submitTask,
} = require("../controllers/task.controller");

const router = Router();

router.get("/", authenticate, getTasks);
router.get(
  "/my",
  authenticate,
  authorize("annotator", "admin", "manager", "reviewer"),
  getMyTasks,
);
router.get("/:id", authenticate, getTaskById);

router.post("/", authenticate, authorize("admin"), createTask);
router.patch("/:id", authenticate, authorize("admin"), updateTask);
router.delete("/:id", authenticate, authorize("admin"), deleteTask);

router.patch("/:id/assign", authenticate, authorize("admin"), assignTask);
router.patch("/:id/unassign", authenticate, authorize("admin"), unassignTask);

router.patch("/:id/submit", authenticate, submitTask);

module.exports = router;
