import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { QuizResult } from "@/models/QuizResult";
import { Student } from "@/models/Student";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendMail } from "@/lib/sendMail";
import moment from "moment-timezone";

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Student role required." }, { status: 403 });
    }

    const { fileName, answers } = await request.json();

    if (!fileName || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ isSuccess: false, message: "fileName and answers array are required" }, { status: 400 });
    }

    // Check if already submitted
    const existingSubmission = await QuizResult.findOne({
      userId: user.id,
      fileName,
    });

    if (existingSubmission) {
      return NextResponse.json({ isSuccess: false, message: "You have already submitted this quiz. Only one attempt is allowed." }, { status: 403 });
    }

    // Fetch quiz questions
    const quizzes = await Quiz.find({ fileName });
    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ isSuccess: false, message: "No quizzes found for this file" }, { status: 404 });
    }

    let correctCount = 0;
    const results: any[] = [];

    for (const quiz of quizzes) {
      const submitted = answers.find((ans: any) => ans.questionId === quiz._id.toString());
      const selectedAnswer = submitted ? submitted.selectedAnswer : "";
      const isCorrect = quiz.CorrectAnswer === selectedAnswer;

      if (isCorrect) correctCount++;

      results.push({
        questionId: quiz._id,
        question: quiz.Question,
        selectedAnswer,
        correctAnswer: quiz.CorrectAnswer,
        isCorrect,
      });
    }

    const score = (correctCount / quizzes.length) * 100;

    const quizResult = new QuizResult({
      userId: user.id,
      fileName,
      score,
      correctCount,
      totalQuestions: quizzes.length,
      results,
      submittedAt: moment().tz("Asia/Kolkata").toDate(),
    });

    await quizResult.save();

    // Check if the quiz has ended/expired
    const quizObj = await Quiz.findOne({ fileName });
    const now = new Date();
    const isQuizEnded = quizObj ? (quizObj.isExpired || quizObj.endTime <= now) : false;

    // Trigger async email in background - disabled as per user request
    /*
    import("@/lib/mailTemplates").then(({ resultTemplate }) => {
      const emailHtml = resultTemplate(
        fileName,
        user.name,
        score.toFixed(2),
        correctCount,
        quizzes.length,
        results
      );

      sendMail(
        user.email,
        process.env.mail || "noreply@yourplatform.com",
        `Quiz Result: ${fileName}`,
        emailHtml
      ).catch((err) => console.error("Error sending result email:", err));
    });
    */

    return NextResponse.json({
      isSuccess: true,
      message: "Quiz submitted successfully.",
      data: quizResult,
    });
  } catch (error: any) {
    console.error("Submit Quiz Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
