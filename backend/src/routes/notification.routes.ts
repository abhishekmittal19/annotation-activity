import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);

export default router;
