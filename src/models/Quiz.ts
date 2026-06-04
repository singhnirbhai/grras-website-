import mongoose, { Schema, model, models } from "mongoose";

const quizSchema = new Schema(
  {
    Question: {
      type: String,
      required: true,
    },
    Options: {
      type: [String],
      required: true,
    },
    Course: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
    CorrectAnswer: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for performance
quizSchema.index({ startTime: 1, endTime: 1 });
quizSchema.index({ isActive: 1, isExpired: 1 });
quizSchema.index({ Course: 1, fileName: 1 });

export const Quiz = models.quiz || model("quiz", quizSchema);
