import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { getUsers } from "../controllers/user.controller";

const router = Router();


router.get("/", authenticate, authorize("admin"), getUsers);

export default router;
