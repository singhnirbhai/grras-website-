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
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { isSuccess: false, message: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "admin") {
      let admin = await MasterAdmin.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
      });

      // Seeding a default administrator if none exists
      if (!admin && (normalizedEmail === "admin@grras.com" || normalizedEmail === "admin@example.com")) {
        const defaultPassword = normalizedEmail === "admin@example.com" ? "admin" : password;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        admin = new MasterAdmin({
          email: normalizedEmail,
          password: hashedPassword,
        });
        await admin.save();
      }

      if (!admin) {
        return NextResponse.json({ isSuccess: false, message: "Admin not found" }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return NextResponse.json({ isSuccess: false, message: "Invalid credentials" }, { status: 400 });
      }

      const secret = process.env.secret_key || process.env.SECRET_KEY;
      if (!secret) {
        throw new Error("secret_key is not defined in the environment variables.");
      }
      const token = jwt.sign({ _id: admin._id }, secret);
      
      const response = NextResponse.json({
        isSuccess: true,
        message: "Admin logged in successfully",
        role: "admin",
      });

      response.cookies.set("masterAdminauthToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return response;
    } else if (role === "faculty") {
      const faculty = await Faculty.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
      });

      if (!faculty) {
        return NextResponse.json({ isSuccess: false, message: "Faculty not found" }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(password, faculty.password);
      if (!isPasswordValid) {
        return NextResponse.json({ isSuccess: false, message: "Invalid credentials" }, { status: 400 });
      }

      const secret = process.env.faculty_key || process.env.FACULTY_KEY;
      if (!secret) {
        throw new Error("faculty_key is not defined in the environment variables.");
      }
      const token = jwt.sign({ _id: faculty._id }, secret, {
        expiresIn: "1d",
      });

      const response = NextResponse.json({
        isSuccess: true,
        message: "Faculty logged in successfully",
        role: "faculty",
        faculty: {
          id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          course: faculty.course,
        },
      });

      response.cookies.set("facultyToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return response;
    } else if (role === "student") {
      const student = await Student.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
      });

      if (!student) {
        return NextResponse.json({ isSuccess: false, message: "Student not found" }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        return NextResponse.json({ isSuccess: false, message: "Invalid credentials" }, { status: 400 });
      }

      const secret = process.env.student_key || process.env.STUDENT_KEY;
      if (!secret) {
        throw new Error("student_key is not defined in the environment variables.");
      }
      const token = jwt.sign({ _id: student._id }, secret, {
        expiresIn: "1d",
      });

      const response = NextResponse.json({
        isSuccess: true,
        message: "Student logged in successfully",
        role: "student",
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          userId: student.userId,
        },
      });

      response.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ isSuccess: false, message: "Invalid role specified" }, { status: 400 });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
