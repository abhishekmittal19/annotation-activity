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
console.log({
  authenticate: typeof authenticate,
  authorize: typeof authorize,
  getTasks: typeof getTasks,
  getTaskById: typeof getTaskById,
  createTask: typeof createTask,
  updateTask: typeof updateTask,
  deleteTask: typeof deleteTask,
  assignTask: typeof assignTask,
  unassignTask: typeof unassignTask,
  getMyTasks: typeof getMyTasks,
  submitTask: typeof submitTask,
});

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

router.patch(
  "/:id/assign",
  authenticate,
  authorize("admin", "manager"),
  assignTask,
);
router.patch("/:id/unassign", authenticate, authorize("admin"), unassignTask);

router.patch("/:id/submit", authenticate, submitTask);

module.exports = router;
