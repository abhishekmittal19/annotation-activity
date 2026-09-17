import mongoose, { Schema, Document } from "mongoose";

export interface IAnnotation extends Document {
  task: mongoose.Types.ObjectId;
  annotator: mongoose.Types.ObjectId;
  type: "bounding_box" | "polygon" | "classification" | "keypoint";
  label: string;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: Array<{
      x: number;
      y: number;
    }>;
    value?: string;
  };
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    annotator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["bounding_box", "polygon", "classification", "keypoint"],
    },

    label: {
      type: String,
      required: true,
    },

    data: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,

      points: [
        {
          x: Number,
          y: Number,
        },
      ],

      value: String,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAnnotation>("Annotation", AnnotationSchema);
