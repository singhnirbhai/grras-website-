import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Student } from "@/models/Student";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendMail } from "@/lib/sendMail";

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin or Faculty role required." }, { status: 403 });
    }

    let query = {};
    if (user.role === "faculty") {
      if (!user.course) {
        return NextResponse.json({ isSuccess: false, message: "Faculty member has no course assigned." }, { status: 400 });
      }
      const courseQuery = user.course.toLowerCase().trim();
      const BatchModel = (await import("@/models/Batch")).Batch;
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      query = {
        course: courseQuery,
        $or: [
          { createdBy: user.email.toLowerCase().trim() },
          { batch: { $in: batchNames } }
        ]
      };
    }

    const students = await Student.find(query).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({
      isSuccess: true,
      message: "Students retrieved successfully",
      allData: students,
    });
  } catch (error: any) {
    console.error("GET Student Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin or Faculty role required." }, { status: 403 });
    }

    const { name, email, course, password } = await request.json();
    const studentCourse = user.role === "faculty" ? user.course : course;

    if (!name || !email || !studentCourse || !password) {
      return NextResponse.json({ isSuccess: false, message: "Name, email, course, and password are required" }, { status: 400 });
    }

    const CourseModel = (await import("@/models/Course")).Course;
    const foundCourse = await CourseModel.findOne({ name: { $regex: new RegExp(`^${studentCourse.trim()}$`, "i") } });
    if (!foundCourse) {
      return NextResponse.json({ isSuccess: false, message: `Course "${studentCourse}" not found. Please create the course first.` }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingStudent = await Student.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (existingStudent) {
      return NextResponse.json({ isSuccess: false, message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `student-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const student = new Student({
      name,
      email: normalizedEmail,
      course: foundCourse.name.toLowerCase().trim(),
      batch: "",
      password: hashedPassword,
      userId,
      createdBy: user.role === "faculty" ? user.email.toLowerCase().trim() : "admin",
    });

    await student.save();

    // Send welcome email asynchronously without blocking the response
    import("@/lib/mailTemplates").then(({ studentWelcomeTemplate }) => {
      const emailHtml = studentWelcomeTemplate({
        name,
        email: normalizedEmail,
        password,
        userId,
      });

      sendMail(
        normalizedEmail,
        process.env.mail || "noreply@yourplatform.com",
        "🎓 Welcome to Academic Platform - Student Account Details",
        emailHtml
      ).catch((err) => console.error("Error sending student welcome email:", err));
    });

    return NextResponse.json({
      isSuccess: true,
      message: "Student added successfully. Welcome email sent.",
      studentId: userId,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Student Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin or Faculty role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Student ID is required" }, { status: 400 });
    }

    const body = await request.json();
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    
    if (body.batch) {
      const BatchModel = (await import("@/models/Batch")).Batch;
      const foundBatch = await BatchModel.findOne({ name: { $regex: new RegExp(`^${body.batch.trim()}$`, "i") } });
      if (foundBatch) {
        body.course = foundBatch.course.toLowerCase().trim();
        body.batch = foundBatch.name;
        body.assignedAt = new Date();
      }
    } else if (body.course) {
      body.course = body.course.toLowerCase().trim();
    }

    if (user.role === "faculty") {
      const studentToEdit = await Student.findById(id);
      if (!studentToEdit) {
        return NextResponse.json({ isSuccess: false, message: "Student not found" }, { status: 404 });
      }
      const BatchModel = (await import("@/models/Batch")).Batch;
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      const hasAccess = 
        studentToEdit.createdBy?.toLowerCase() === user.email.toLowerCase().trim() ||
        batchNames.includes(studentToEdit.batch);

      if (!hasAccess || studentToEdit.course !== user.course?.toLowerCase().trim()) {
        return NextResponse.json({ isSuccess: false, message: "Access denied. You can only edit students created by you or in your batch." }, { status: 403 });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, body, { new: true });
    if (!updatedStudent) {
      return NextResponse.json({ isSuccess: false, message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Student updated successfully",
      updatedData: updatedStudent,
    });
  } catch (error: any) {
    console.error("PUT Student Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin or Faculty role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Student ID is required" }, { status: 400 });
    }

    if (user.role === "faculty") {
      const studentToDelete = await Student.findById(id);
      if (!studentToDelete) {
        return NextResponse.json({ isSuccess: false, message: "Student not found" }, { status: 404 });
      }
      const BatchModel = (await import("@/models/Batch")).Batch;
      const facultyBatches = await BatchModel.find({
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      }).select("name");
      const batchNames = facultyBatches.map(b => b.name);

      const hasAccess = 
        studentToDelete.createdBy?.toLowerCase() === user.email.toLowerCase().trim() ||
        batchNames.includes(studentToDelete.batch);

      if (!hasAccess || studentToDelete.course !== user.course?.toLowerCase().trim()) {
        return NextResponse.json({ isSuccess: false, message: "Access denied. You can only delete students created by you or in your batch." }, { status: 403 });
      }
    }

    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return NextResponse.json({ isSuccess: false, message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Student deleted successfully",
      deletData: deletedStudent,
    });
  } catch (error: any) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
