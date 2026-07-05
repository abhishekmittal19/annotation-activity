import { Router } from "express";

import { getTasks, getTaskById } from "../controllers/task.controller";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);

export default router;
