import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  type: string;
  status: string;
  priority: string;
  assignee: mongoose.Types.ObjectId | null;
  annotationCount: number;
  meta?: {
    source?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["image", "text", "audio", "video"],
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    annotationCount: {
      type: Number,
      default: 0,
    },

    meta: {
      source: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ITask>("Task", TaskSchema);
