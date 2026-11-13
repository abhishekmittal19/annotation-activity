const { Router } = require("express");

const { authenticate } = require("../middleware/auth.middleware");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notification.controller");

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);

module.exports = router;
