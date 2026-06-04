import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MasterAdmin } from "@/models/MasterAdmin";
import { Faculty } from "@/models/Faculty";
import { Student } from "@/models/Student";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized or session expired" }, { status: 401 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error: any) {
    console.error("Profile GET API Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();
    const updates: any = {};

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (user.role === "admin") {
      const updateData: any = {};
      if (password) updateData.password = updates.password;
      if (email) {
        const existing = await MasterAdmin.findOne({ email: email.trim().toLowerCase(), _id: { $ne: user.id } });
        if (existing) {
          return NextResponse.json({ isSuccess: false, message: "Email is already in use by another administrator" }, { status: 400 });
        }
        updateData.email = email.trim().toLowerCase();
      }
      await MasterAdmin.findByIdAndUpdate(user.id, updateData);
    } else if (user.role === "faculty") {
      if (name) updates.name = name;
      if (email) {
        const existing = await Faculty.findOne({ email: email.trim().toLowerCase(), _id: { $ne: user.id } });
        if (existing) {
          return NextResponse.json({ isSuccess: false, message: "Email is already in use by another instructor" }, { status: 400 });
        }
        updates.email = email.trim().toLowerCase();
      }
      await Faculty.findByIdAndUpdate(user.id, updates);
    } else if (user.role === "student") {
      if (name) updates.name = name;
      if (email) {
        const existing = await Student.findOne({ email: email.trim().toLowerCase(), _id: { $ne: user.id } });
        if (existing) {
          return NextResponse.json({ isSuccess: false, message: "Email is already in use by another student" }, { status: 400 });
        }
        updates.email = email.trim().toLowerCase();
      }
      await Student.findByIdAndUpdate(user.id, updates);
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Profile PUT API Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
