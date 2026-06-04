import mongoose, { Schema, model, models } from "mongoose";

const masterAdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const MasterAdmin = models.masterAdmin || model("masterAdmin", masterAdminSchema);
