import mongoose, { Schema, model, models } from "mongoose";

const quizResultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    score: {
      type: Number, // Percentage score
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    results: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "quiz",
        },
        question: {
          type: String,
        },
        selectedAnswer: {
          type: String,
        },
        correctAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for performance optimization
quizResultSchema.index({ userId: 1 });
quizResultSchema.index({ fileName: 1 });
quizResultSchema.index({ submittedAt: -1 });

export const QuizResult = models.QuizResult || model("QuizResult", quizResultSchema);
