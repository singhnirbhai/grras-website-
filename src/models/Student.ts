import mongoose, { Schema, model, models } from "mongoose";

const studentSchema = new Schema(
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
    course: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
    assignedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

studentSchema.index({ course: 1, batch: 1 });
studentSchema.index({ createdBy: 1 });

if (models.student) {
  delete (models as any).student;
}
export const Student = model("student", studentSchema);
