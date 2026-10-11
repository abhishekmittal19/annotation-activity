import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    otpHash: {
      type: String,
      required: false,
    },

    otpExpiresAt: {
      type: Date,
      required: false,
    },

    role: {
      type: String,
      enum: ["admin", "annotator"],
      default: "annotator",
    },
  },
  {
    timestamps: true,
  },
);

export const User = model("User", userSchema);
