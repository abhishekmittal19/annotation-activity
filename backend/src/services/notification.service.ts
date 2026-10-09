import { Notification, NotificationType } from "../models/notification.model";

export class NotificationService {
  async getForUser(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("taskId", "taskId title")
        .lean(),

      Notification.countDocuments({
        userId,
        isRead: false,
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId,
      },
      {
        $set: { isRead: true },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );

    return {
      updatedCount: result.modifiedCount,
    };
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    taskId?: string | null;
  }) {
    return Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      taskId: data.taskId || null,
    });
  }
}
