import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { QuizResult } from "@/models/QuizResult";
import { Student } from "@/models/Student";
import { getAuthenticatedUser } from "@/lib/auth";
import moment from "moment-timezone";

import { Quiz } from "@/models/Quiz";

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ isSuccess: false, message: "fileName query parameter is required" }, { status: 400 });
    }

    const batch = searchParams.get("batch");

    // Force register Student model in mongoose to allow population
    const studentsModelLoaded = Student; 

    let query: any = { fileName };
    if (batch) {
      const students = await Student.find({ batch: { $regex: new RegExp(`^${batch.trim()}$`, "i") } }).select("_id").lean();
      const studentIds = students.map((s) => s._id);
      query.userId = { $in: studentIds };
    }

    const leaderboard = await QuizResult.find(query)
      .sort({ score: -1, submittedAt: -1 })
      .limit(10)
      .select("userId score correctCount totalQuestions submittedAt")
      .populate("userId", "name email batch")
      .lean();

    const formattedLeaderboard = leaderboard.map((result: any) => {
      const populatedUser = result.userId;
      return {
        _id: result._id,
        score: result.score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        submittedAt: moment(result.submittedAt).tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss"),
        studentName: populatedUser ? populatedUser.name : "Unknown Student",
        studentEmail: populatedUser ? populatedUser.email : "",
        batch: populatedUser ? populatedUser.batch : "",
      };
    });

    const userSubmission = await QuizResult.findOne({
      userId: user.id,
      fileName,
    }).lean();

    return NextResponse.json({
      isSuccess: true,
      message: "Leaderboard retrieved successfully",
      data: {
        leaderboard: formattedLeaderboard,
        hasSubmitted: !!userSubmission,
      },
    });
  } catch (error: any) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
