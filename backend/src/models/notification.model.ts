import { Schema, model, Types } from "mongoose";

export type NotificationType =
  | "USER_REGISTERED"
  | "TASK_ASSIGNED"
  | "TASK_SUBMITTED"
  | "REVIEW_REQUIRED"
  | "TASK_APPROVED"
  | "TASK_REWORK_REQUIRED";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "USER_REGISTERED",
        "TASK_ASSIGNED",
        "TASK_SUBMITTED",
        "REVIEW_REQUIRED",
        "TASK_APPROVED",
        "TASK_REWORK_REQUIRED",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model("Notification", notificationSchema);

export type INotification = {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: Types.ObjectId | null;
  isRead: boolean;
  createdAt: Date;
};
