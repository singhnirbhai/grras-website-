import mongoose, { Schema, model, models } from "mongoose";

const facultySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

facultySchema.index({ course: 1 });

export const Faculty = models.Faculty || model("Faculty", facultySchema);
