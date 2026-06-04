import mongoose, { Schema, model, models } from "mongoose";

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Course = models.Course || model("Course", courseSchema);
