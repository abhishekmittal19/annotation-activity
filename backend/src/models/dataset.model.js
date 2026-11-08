import { Schema, model } from "mongoose";

const datasetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    fileType: {
      type: String,
      enum: ["csv", "json"],
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    records: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Dataset = model("Dataset", datasetSchema);
