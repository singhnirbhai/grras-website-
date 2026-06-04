import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Batch } from "@/models/Batch";
import { Student } from "@/models/Student";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 401 });
    }

    let query: any = {};
    if (user.role === "faculty") {
      query = {
        course: user.course,
        $or: [
          { faculty: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
          { faculty: { $regex: new RegExp(`^${user.name?.trim()}$`, "i") } }
        ]
      };
    }

    const batches = await Batch.find(query).sort({ name: 1 });
    return NextResponse.json({
      isSuccess: true,
      message: "Batches retrieved successfully",
      data: batches,
    });
  } catch (error: any) {
    console.error("GET Batch Error:", error);
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

    const { name, course, faculty, students, days, timing } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ isSuccess: false, message: "Batch name is required" }, { status: 400 });
    }

    const batchCourse = user.role === "faculty" ? user.course : course;
    if (!batchCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course name is required" }, { status: 400 });
    }

    const normalizedName = name.trim();

    const existingBatch = await Batch.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingBatch) {
      return NextResponse.json({ isSuccess: false, message: "Batch name already exists" }, { status: 400 });
    }

    const batch = new Batch({
      name: normalizedName,
      course: batchCourse.trim(),
      faculty: faculty || "",
      students: students || [],
      days: days || [],
      timing: timing || "",
      createdBy: user.email,
    });

    await batch.save();

    // Update students batch field
    if (students && students.length > 0) {
      await Student.updateMany(
        { userId: { $in: students } },
        { batch: normalizedName, assignedAt: new Date() }
      );
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Batch created successfully",
      data: batch,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Batch Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return NextResponse.json({ isSuccess: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Batch ID is required" }, { status: 400 });
    }

    const { name, course, faculty, students, days, timing } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ isSuccess: false, message: "Batch name is required" }, { status: 400 });
    }

    const batchCourse = user.role === "faculty" ? user.course : course;
    if (!batchCourse) {
      return NextResponse.json({ isSuccess: false, message: "Course name is required" }, { status: 400 });
    }

    const normalizedName = name.trim();

    const existingBatch = await Batch.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
      _id: { $ne: id },
    });

    if (existingBatch) {
      return NextResponse.json({ isSuccess: false, message: "Batch name already exists" }, { status: 400 });
    }

    // If faculty is editing, verify ownership or course alignment
    const batchToEdit = await Batch.findById(id);
    if (!batchToEdit) {
      return NextResponse.json({ isSuccess: false, message: "Batch not found" }, { status: 404 });
    }

    if (user.role === "faculty") {
      const isOwner = batchToEdit.faculty?.toLowerCase() === user.email?.toLowerCase() ||
                      batchToEdit.faculty?.toLowerCase() === user.name?.toLowerCase();
      if (!isOwner || batchToEdit.course !== user.course) {
        return NextResponse.json({ isSuccess: false, message: "Access denied. You can only edit batches assigned to you." }, { status: 403 });
      }
    }

    const oldName = batchToEdit.name;

    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      { 
        name: normalizedName, 
        course: batchCourse.trim(),
        faculty: faculty || "",
        students: students || [],
        days: days || [],
        timing: timing || ""
      },
      { new: true }
    );

    // Update students batch field
    const oldStudents = batchToEdit.students || [];
    const newStudents = students || [];

    // Students to remove (in old but not in new)
    const removedStudents = oldStudents.filter((sId: string) => !newStudents.includes(sId));
    // Students to add (in new but not in old)
    const addedStudents = newStudents.filter((sId: string) => !oldStudents.includes(sId));

    // 1. Clear batch name and assignedAt from students who were removed
    if (removedStudents.length > 0) {
      await Student.updateMany(
        { userId: { $in: removedStudents } },
        { batch: "", $unset: { assignedAt: "" } }
      );
    }

    // 2. Set batch name and assignedAt for newly added students
    if (addedStudents.length > 0) {
      await Student.updateMany(
        { userId: { $in: addedStudents } },
        { batch: normalizedName, assignedAt: new Date() }
      );
    }

    // 3. For remaining students, if batch name itself changed, update their batch name
    if (oldName !== normalizedName) {
      const remainingStudents = newStudents.filter((sId: string) => oldStudents.includes(sId));
      if (remainingStudents.length > 0) {
        await Student.updateMany(
          { userId: { $in: remainingStudents } },
          { batch: normalizedName }
        );
      }
    }

    if (!updatedBatch) {
      return NextResponse.json({ isSuccess: false, message: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error: any) {
    console.error("PUT Batch Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ isSuccess: false, message: "Access denied. Only administrators can delete batches." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ isSuccess: false, message: "Batch ID is required" }, { status: 400 });
    }

    const deletedBatch = await Batch.findByIdAndDelete(id);
    if (!deletedBatch) {
      return NextResponse.json({ isSuccess: false, message: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSuccess: true,
      message: "Batch deleted successfully",
      data: deletedBatch,
    });
  } catch (error: any) {
    console.error("DELETE Batch Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
