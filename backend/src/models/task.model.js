const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["image", "text", "audio", "video"],
    },

    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "rework_required",
        "completed",
      ],
      default: "pending",
    },

    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    assignee: {
      type: String,
      ref: "User",
      default: null,
    },

    annotationCount: {
      type: Number,
      default: 0,
    },

    meta: {
      type: {
        source: {
          type: String,
        },
        imageUrl: {
          type: String,
        },
      },
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
