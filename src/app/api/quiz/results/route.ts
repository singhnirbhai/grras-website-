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

    // Force register Student model
    const studentModelLoaded = Student;

    let query: any = {};

    if (user.role === "student") {
      query.userId = user.id;
    } else if (user.role === "faculty") {
      const courseQuery = user.course?.toLowerCase().trim();
      const BatchModel = (await import("@/models/Batch")).Batch;
      
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      const students = await Student.find({
        course: courseQuery,
        $or: [
          { createdBy: user.email.toLowerCase().trim() },
          { batch: { $in: batchNames } }
        ]
      }).select("_id");

      const studentIds = students.map((s) => s._id);
      query.userId = { $in: studentIds };
    }

    if (fileName) {
      query.fileName = fileName;
    }

    const results = await QuizResult.find(query)
      .sort({ submittedAt: -1 })
      .populate("userId", "name email course batch userId");

    // Fetch quiz end times to check if they have ended
    const fileNames = Array.from(new Set(results.map((r: any) => r.fileName)));
    const quizzes = await Quiz.find({ fileName: { $in: fileNames } });
    const quizEndTimes: Record<string, Date> = {};
    quizzes.forEach((q: any) => {
      quizEndTimes[q.fileName] = q.endTime;
    });

    const formattedResults = results.map((result: any) => {
      const student = result.userId;
      const endTime = quizEndTimes[result.fileName];
      const isQuizOngoing = endTime ? moment().isBefore(moment(endTime)) : false;

      // If quiz is ongoing and user is student, hide correct answers to prevent cheating
      const detailedResults = (result.results || []).map((q: any) => {
        if (user.role === "student" && isQuizOngoing) {
          return {
            question: q.question,
            selectedAnswer: q.selectedAnswer,
            correctAnswer: "Hidden until exam duration complete",
            isCorrect: null,
          };
        }
        return q;
      });

      return {
        _id: result._id,
        fileName: result.fileName,
        score: isQuizOngoing && user.role === "student" ? null : result.score,
        correctCount: isQuizOngoing && user.role === "student" ? null : result.correctCount,
        totalQuestions: result.totalQuestions,
        submittedAt: moment(result.submittedAt).tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss"),
        endTime: endTime ? moment(endTime).tz("Asia/Kolkata").format() : null,
        isQuizOngoing: !!isQuizOngoing,
        student: student
          ? {
              _id: student._id,
              name: student.name,
              email: student.email,
              course: student.course,
              batch: student.batch,
              userId: student.userId,
            }
          : {
              _id: null,
              name: "Deleted Student",
              email: "",
              course: "",
              batch: "",
              userId: "",
            },
        results: detailedResults,
      };
    });

    return NextResponse.json({
      isSuccess: true,
      message: "Results retrieved successfully",
      data: formattedResults,
    });
  } catch (error: any) {
    console.error("GET Quiz Results Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Result ID is required" }, { status: 400 });
    }

    const resultToDelete = await QuizResult.findById(id);
    if (!resultToDelete) {
      return NextResponse.json({ isSuccess: false, message: "Result not found" }, { status: 404 });
    }

    if (user.role === "faculty") {
      const BatchModel = (await import("@/models/Batch")).Batch;
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      const student = await Student.findById(resultToDelete.userId);
      if (!student) {
        return NextResponse.json({ isSuccess: false, message: "Associated student not found" }, { status: 404 });
      }

      const hasAccess = 
        student.createdBy?.toLowerCase() === user.email.toLowerCase().trim() ||
        batchNames.includes(student.batch);

      if (!hasAccess || student.course !== user.course?.toLowerCase().trim()) {
        return NextResponse.json({ isSuccess: false, message: "Access denied. You can only delete results for your students." }, { status: 403 });
      }
    }

    const deleted = await QuizResult.findByIdAndDelete(id);

    return NextResponse.json({
      isSuccess: true,
      message: "Result deleted successfully",
      data: deleted,
    });
  } catch (error: any) {
    console.error("DELETE Result Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
// Force reload comment at 09:18:00
