import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Faculty } from "@/models/Faculty";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendMail } from "@/lib/sendMail";

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const faculties = await Faculty.find().sort({ createdAt: -1 });
    return NextResponse.json({
      isSuccess: true,
      message: "Faculties retrieved successfully",
      allData: faculties,
    });
  } catch (error: any) {
    console.error("GET Faculty Error:", error);
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

    const { name, email, course, password } = await request.json();

    if (!name || !email || !course || !password) {
      return NextResponse.json({ isSuccess: false, message: "All fields are required (name, email, course, password)" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingFaculty = await Faculty.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (existingFaculty) {
      return NextResponse.json({ isSuccess: false, message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({
      name,
      email: normalizedEmail,
      course: course.trim(),
      password: hashedPassword,
    });

    await faculty.save();

    // Send Welcome Email in background asynchronously without blocking
    import("@/lib/mailTemplates").then(({ facultyWelcomeTemplate }) => {
      const emailHtml = facultyWelcomeTemplate({
        name,
        email: normalizedEmail,
        password,
      });

      sendMail(
        normalizedEmail,
        process.env.mail || "noreply@yourplatform.com",
        "🎓 Welcome to Academic Platform - Faculty Account Details",
        emailHtml
      ).catch((err) => console.error("Error sending welcome email:", err));
    });

    return NextResponse.json({
      isSuccess: true,
      message: "Faculty added successfully. Welcome email sent.",
      data: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        course: faculty.course,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Faculty Error:", error);
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
      return NextResponse.json({ isSuccess: false, message: "Faculty ID is required" }, { status: 400 });
    }

    const body = await request.json();
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(id, body, { new: true });
    if (!updatedFaculty) {
      return NextResponse.json({ isSuccess: false, message: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Faculty updated successfully",
      updatedData: updatedFaculty,
    });
  } catch (error: any) {
    console.error("PUT Faculty Error:", error);
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
      return NextResponse.json({ isSuccess: false, message: "Faculty ID is required" }, { status: 400 });
    }

    const deletedFaculty = await Faculty.findByIdAndDelete(id);
    if (!deletedFaculty) {
      return NextResponse.json({ isSuccess: false, message: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Faculty deleted successfully",
      deletData: deletedFaculty,
    });
  } catch (error: any) {
    console.error("DELETE Faculty Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
