import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { MasterAdmin } from "@/models/MasterAdmin";
import { Faculty } from "@/models/Faculty";
import { Student } from "@/models/Student";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { password, token, role } = await request.json();

    if (!password || !token || !role) {
      return NextResponse.json({ isSuccess: false, message: "Password, token, and role are required" }, { status: 400 });
    }

    let jwtKey = "";
    if (role === "admin") {
      const secret = process.env.secret_key || process.env.SECRET_KEY;
      if (!secret) throw new Error("secret_key is not defined in environment");
      jwtKey = secret;
    } else if (role === "faculty") {
      const secret = process.env.faculty_key || process.env.FACULTY_KEY;
      if (!secret) throw new Error("faculty_key is not defined in environment");
      jwtKey = secret;
    } else if (role === "student") {
      const secret = process.env.student_key || process.env.STUDENT_KEY;
      if (!secret) throw new Error("student_key is not defined in environment");
      jwtKey = secret;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtKey);
    } catch (e) {
      return NextResponse.json({ isSuccess: false, message: "Invalid or expired password reset link." }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "admin") {
      await MasterAdmin.findByIdAndUpdate(decoded._id, { password: hashedPassword });
    } else if (role === "faculty") {
      await Faculty.findByIdAndUpdate(decoded._id, { password: hashedPassword });
    } else if (role === "student") {
      await Student.findByIdAndUpdate(decoded._id, { password: hashedPassword });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Your password has been successfully reset. Please log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
