import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/models/Course";
import { getAuthenticatedUser } from "@/lib/auth";
import { measure, nextResponseWithTiming } from "@/lib/perf";

export async function GET(request: Request) {
  const startTime = performance.now();
  try {
    const { durationMs: dbConnTime } = await measure("DB Connection (Course GET)", () => connectDB());
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { result: courses, durationMs: dbQueryTime } = await measure("Course.find (Course GET)", () =>
      Course.find().sort({ name: 1 }).lean()
    );

    const totalTime = performance.now() - startTime;

    return nextResponseWithTiming(
      {
        isSuccess: true,
        message: "Courses retrieved successfully",
        data: courses,
      },
      {
        dbConnect: dbConnTime,
        dbQuery: dbQueryTime,
        totalApi: totalTime,
      }
    );
  } catch (error: any) {
    console.error("GET Course Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ isSuccess: false, message: "Course name is required" }, { status: 400 });
    }

    const normalizedName = name.trim();

    const existingCourse = await Course.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course name already exists" }, { status: 400 });
    }

    const course = new Course({
      name: normalizedName,
      description: description ? description.trim() : "",
    });

    await course.save();

    return NextResponse.json({
      isSuccess: true,
      message: "Course created successfully",
      data: course,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Course Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Course ID is required" }, { status: 400 });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Course deleted successfully",
      data: deletedCourse,
    });
  } catch (error: any) {
    console.error("DELETE Course Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Course ID is required" }, { status: 400 });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ isSuccess: false, message: "Course name is required" }, { status: 400 });
    }

    const normalizedName = name.trim();

    // Check unique course name (excluding self)
    const existingCourse = await Course.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
      _id: { $ne: id }
    });

    if (existingCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course name already exists" }, { status: 400 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { name: normalizedName, description: description ? description.trim() : "" },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error: any) {
    console.error("PUT Course Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

