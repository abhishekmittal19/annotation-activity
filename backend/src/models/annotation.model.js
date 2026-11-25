const mongoose = require("mongoose");

const { Schema } = mongoose;

const AnnotationSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    annotator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["bounding_box"],
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      type: Schema.Types.Mixed,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Annotation", AnnotationSchema);
