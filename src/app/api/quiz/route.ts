import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { getAuthenticatedUser } from "@/lib/auth";
import { updateQuizStatuses } from "@/lib/quizHelper";
import moment from "moment-timezone";

export async function GET(request: Request) {
  try {
    await connectDB();
    await updateQuizStatuses();

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const course = searchParams.get("course");

    // Case 1: Fetch details of a specific quiz file
    if (fileName) {
      const isStudent = user.role === "student";
      // Exclude correct answer for students
      const query = Quiz.find({ fileName });
      if (isStudent) {
        query.select("-CorrectAnswer");
      }
      const quizzes = await query;

      const formattedQuizzes = quizzes.map((quiz) => ({
        ...quiz.toObject(),
        startTime: moment(quiz.startTime).tz("Asia/Kolkata").format(),
        endTime: moment(quiz.endTime).tz("Asia/Kolkata").format(),
      }));

      return NextResponse.json({
        isSuccess: true,
        message: "Quizzes fetched successfully",
        data: formattedQuizzes,
      });
    }

    // Case 2: Student fetching active and scheduled exams for their batch
    if (user.role === "student") {
      const includeExpired = searchParams.get("includeExpired") === "true";
      const queryObj: any = { batch: user.batch };
      if (!includeExpired) {
        queryObj.isExpired = false;
      }
      const activeQuizzes = await Quiz.find(queryObj);

      const groupedQuizzes: Record<string, any> = {};
      const now = moment().tz("Asia/Kolkata");

      activeQuizzes.forEach((quiz) => {
        if (!groupedQuizzes[quiz.fileName]) {
          const startTime = moment(quiz.startTime).tz("Asia/Kolkata");
          const endTime = moment(quiz.endTime).tz("Asia/Kolkata");

          let status = "scheduled";
          if (quiz.isExpired) {
            status = "expired";
          } else if (quiz.isActive) {
            status = "active";
          }

          groupedQuizzes[quiz.fileName] = {
            fileName: quiz.fileName,
            Course: quiz.Course,
            batch: quiz.batch,
            startTime: startTime.format(),
            endTime: endTime.format(),
            duration: quiz.duration,
            isActive: quiz.isActive,
            isExpired: quiz.isExpired,
            status,
            timeRemaining: endTime.diff(now, "minutes"),
            totalQuestions: 0,
          };
        }
        groupedQuizzes[quiz.fileName].totalQuestions += 1;
      });

      return NextResponse.json({
        isSuccess: true,
        message: "Active and scheduled quizzes fetched successfully",
        data: Object.values(groupedQuizzes),
      });
    }

    // Case 3: Admin or Faculty fetching all quiz files (aggregate group)
    let matchQuery: any = {};
    if (user.role === "faculty") {
      const BatchModel = (await import("@/models/Batch")).Batch;
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      matchQuery = {
        Course: user.course?.toLowerCase().trim(),
        batch: { $in: batchNames }
      };
    } else if (course) {
      matchQuery = { Course: course.toLowerCase().trim() };
    }

    const aggregated = await Quiz.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { fileName: "$fileName", Course: "$Course", batch: "$batch" },
          count: { $sum: 1 },
          startTime: { $first: "$startTime" },
          endTime: { $first: "$endTime" },
          duration: { $first: "$duration" },
          isActive: { $first: "$isActive" },
          isExpired: { $first: "$isExpired" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          fileName: "$_id.fileName",
          Course: "$_id.Course",
          batch: "$_id.batch",
          count: 1,
          startTime: 1,
          endTime: 1,
          duration: 1,
          isActive: 1,
          isExpired: 1,
          createdAt: 1,
          status: {
            $cond: {
              if: "$isExpired",
              then: "expired",
              else: {
                $cond: {
                  if: "$isActive",
                  then: "active",
                  else: "scheduled",
                },
              },
            },
          },
          _id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const formattedFiles = aggregated.map((quiz) => ({
      ...quiz,
      startTime: moment(quiz.startTime).tz("Asia/Kolkata").format(),
      endTime: moment(quiz.endTime).tz("Asia/Kolkata").format(),
    }));

    return NextResponse.json({
      isSuccess: true,
      message: "Quiz files retrieved successfully",
      data: formattedFiles,
    });
  } catch (error: any) {
    console.error("GET Quiz Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 403 });
    }

    const { quizzes, course, batch, fileName, startTime, endTime, duration } = await request.json();

    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0 || !course || !batch || !fileName || !startTime || !endTime || !duration) {
      return NextResponse.json({ isSuccess: false, message: "Missing required fields (quizzes, course, batch, fileName, startTime, endTime, duration)" }, { status: 400 });
    }

    // Check if filename already exists
    const existingFile = await Quiz.findOne({ fileName });
    if (existingFile) {
      return NextResponse.json({ isSuccess: false, message: "A quiz file with this name already exists. Please use a different filename." }, { status: 400 });
    }

    const start = moment.tz(startTime, "Asia/Kolkata");
    const end = moment.tz(endTime, "Asia/Kolkata");

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json({ isSuccess: false, message: "Invalid date format for startTime or endTime" }, { status: 400 });
    }

    if (end.isSameOrBefore(start)) {
      return NextResponse.json({ isSuccess: false, message: "End time must be after start time" }, { status: 400 });
    }

    const formattedQuizzes = quizzes.map((quiz: any) => ({
      Question: quiz.Question,
      Options: quiz.Options,
      Course: course.toLowerCase().trim(),
      batch: batch.trim(),
      CorrectAnswer: quiz.CorrectAnswer,
      fileName,
      startTime: start.toDate(),
      endTime: end.toDate(),
      duration,
      isActive: false,
      isExpired: false,
    }));

    const result = await Quiz.insertMany(formattedQuizzes);

    return NextResponse.json({
      isSuccess: true,
      message: `${result.length} quizzes uploaded successfully`,
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Quiz Error:", error);
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
    const fileName = searchParams.get("fileName");

    if (id) {
      if (user.role === "faculty") {
        const quizToDelete = await Quiz.findById(id);
        if (!quizToDelete) {
          return NextResponse.json({ isSuccess: false, message: "Quiz not found" }, { status: 404 });
        }
        const BatchModel = (await import("@/models/Batch")).Batch;
        const facultyBatches = await BatchModel.find({
          $or: [
            { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
            { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
          ]
        }).select("name");
        const batchNames = facultyBatches.map(b => b.name);

        if (!batchNames.includes(quizToDelete.batch)) {
          return NextResponse.json({ isSuccess: false, message: "Access denied. You can only delete quizzes for your batches." }, { status: 403 });
        }
      }
      const deleted = await Quiz.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ isSuccess: false, message: "Quiz not found" }, { status: 404 });
      }
      return NextResponse.json({ isSuccess: true, message: "Quiz deleted successfully", data: deleted });
    }

    if (fileName) {
      if (user.role === "faculty") {
        const quizToDelete = await Quiz.findOne({ fileName });
        if (quizToDelete) {
          const BatchModel = (await import("@/models/Batch")).Batch;
          const facultyBatches = await BatchModel.find({
            $or: [
              { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
              { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
            ]
          }).select("name");
          const batchNames = facultyBatches.map(b => b.name);

          if (!batchNames.includes(quizToDelete.batch)) {
            return NextResponse.json({ isSuccess: false, message: "Access denied. You can only delete quizzes for your batches." }, { status: 403 });
          }
        }
      }
      const deleted = await Quiz.deleteMany({ fileName });
      return NextResponse.json({ isSuccess: true, message: `${deleted.deletedCount} questions deleted successfully for file ${fileName}` });
    }

    return NextResponse.json({ isSuccess: false, message: "id or fileName parameter is required" }, { status: 400 });
  } catch (error: any) {
    console.error("DELETE Quiz Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
