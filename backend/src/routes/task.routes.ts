import { Router } from "express";

import { getTasks } from "../controllers/task.controller";

const router = Router();

router.get("/", getTasks);

export default router;
