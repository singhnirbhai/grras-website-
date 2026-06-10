import { NextResponse, after } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { MasterAdmin } from "@/models/MasterAdmin";
import { Faculty } from "@/models/Faculty";
import { Student } from "@/models/Student";
import { sendMail } from "@/lib/sendMail";
import { resetPasswordTemplate } from "@/lib/mailTemplates";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ isSuccess: false, message: "Email and role are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let userRecord: any = null;
    let jwtKey = "default_key";

    if (role === "admin") {
      userRecord = await MasterAdmin.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      const secret = process.env.secret_key || process.env.SECRET_KEY;
      if (!secret) throw new Error("secret_key is not defined in environment");
      jwtKey = secret;
    } else if (role === "faculty") {
      userRecord = await Faculty.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      const secret = process.env.faculty_key || process.env.FACULTY_KEY;
      if (!secret) throw new Error("faculty_key is not defined in environment");
      jwtKey = secret;
    } else if (role === "student") {
      userRecord = await Student.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      const secret = process.env.student_key || process.env.STUDENT_KEY;
      if (!secret) throw new Error("student_key is not defined in environment");
      jwtKey = secret;
    }

    if (!userRecord) {
      return NextResponse.json({ isSuccess: false, message: "User account not found with the specified role." }, { status: 404 });
    }

    const token = jwt.sign({ _id: userRecord._id, role }, jwtKey, { expiresIn: "15m" });

    // Build the reset link. Next.js runs on request origin context. Let's dynamically read it.
    const url = new URL(request.url);
    const resetLink = `${url.origin}/reset-password?token=${token}&role=${role}`;

    // Send Reset Link email in the background after returning the response
    after(async () => {
      try {
        await sendMail(
          normalizedEmail,
          process.env.mail || "noreply@yourplatform.com",
          "Reset Your Password",
          resetPasswordTemplate(resetLink)
        );
      } catch (err) {
        console.error("Forgot password email error in background:", err);
      }
    });

    return NextResponse.json({
      isSuccess: true,
      message: "Reset password instructions have been sent to your email address.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
