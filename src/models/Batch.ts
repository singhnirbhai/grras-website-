import mongoose, { Schema, model, models } from "mongoose";

const batchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: false,
    },
    students: {
      type: [String],
      required: false,
      default: [],
    },
    days: {
      type: [String],
      required: false,
      default: [],
    },
    timing: {
      type: String,
      required: false,
      default: "",
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

batchSchema.index({ course: 1 });
batchSchema.index({ faculty: 1 });

if (models.Batch) {
  delete (models as any).Batch;
}
export const Batch = model("Batch", batchSchema);
