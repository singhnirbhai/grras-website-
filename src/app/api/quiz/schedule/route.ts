import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { getAuthenticatedUser } from "@/lib/auth";
import moment from "moment-timezone";

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 403 });
    }

    const { fileName, course, startTime, endTime, duration } = await request.json();

    if (!fileName || !course || !startTime || !endTime || !duration) {
      return NextResponse.json({ isSuccess: false, message: "Missing required fields" }, { status: 400 });
    }

    const start = moment.tz(startTime, "Asia/Kolkata");
    const end = moment.tz(endTime, "Asia/Kolkata");

    if (end.isSameOrBefore(start)) {
      return NextResponse.json({ isSuccess: false, message: "Start time must be before end time" }, { status: 400 });
    }

    // Verify course & batch access for faculty
    if (user.role === "faculty") {
      if (course.toLowerCase().trim() !== user.course?.toLowerCase().trim()) {
        return NextResponse.json({ isSuccess: false, message: "Unauthorized to reschedule quizzes for other courses" }, { status: 403 });
      }

      const quizToReschedule = await Quiz.findOne({ fileName, Course: course.toLowerCase().trim() });
      if (quizToReschedule) {
        const BatchModel = (await import("@/models/Batch")).Batch;
        const facultyBatches = await BatchModel.find({
          $or: [
            { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
            { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
          ]
        }).select("name");
        const batchNames = facultyBatches.map(b => b.name);

        if (!batchNames.includes(quizToReschedule.batch)) {
          return NextResponse.json({ isSuccess: false, message: "Access denied. You can only reschedule quizzes for your batches." }, { status: 403 });
        }
      }
    }

    const updated = await Quiz.updateMany(
      { fileName, Course: course.toLowerCase().trim() },
      {
        $set: {
          startTime: start.toDate(),
          endTime: end.toDate(),
          duration,
          isActive: false,
          isExpired: false,
        },
      }
    );

    return NextResponse.json({
      isSuccess: true,
      message: `Quiz schedule updated successfully. Affected: ${updated.modifiedCount}`,
    });
  } catch (error: any) {
    console.error("Reschedule Quiz Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
