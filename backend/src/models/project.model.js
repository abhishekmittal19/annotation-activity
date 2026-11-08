import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    taskType: {
      type: String,
      required: true,
      enum: ["text-classification", "image-annotation", "text-annotation"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Project = model("Project", projectSchema);
