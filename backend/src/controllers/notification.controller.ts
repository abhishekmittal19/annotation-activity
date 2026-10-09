import { Request, Response } from "express";
import mongoose from "mongoose";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

function getAuthenticatedUserId(req: Request): string | null {
  const user = req.user;

  if (!user?.id || !mongoose.isValidObjectId(user.id)) {
    return null;
  }

  return user.id;
}

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    const result = await notificationService.getForUser(userId);

    return res.json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to retrieve notifications",
    });
  }
};


export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authenticated user",
      });
    }

    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await notificationService.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      message: "Failed to update notification",
    });
  }
};


export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    const result = await notificationService.markAllAsRead(userId);

    return res.json({
      success: true,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    return res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};
