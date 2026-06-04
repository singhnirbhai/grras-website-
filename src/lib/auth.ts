import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "./db";
import { MasterAdmin } from "@/models/MasterAdmin";
import { Faculty } from "@/models/Faculty";
import { Student } from "@/models/Student";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "faculty" | "student";
  course?: string;
  batch?: string;
}

const SECRET_KEY = process.env.secret_key || process.env.SECRET_KEY;
const FACULTY_KEY = process.env.faculty_key || process.env.FACULTY_KEY;
const STUDENT_KEY = process.env.student_key || process.env.STUDENT_KEY;

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  await connectDB();
  const cookieStore = await cookies();

  if (!SECRET_KEY || !FACULTY_KEY || !STUDENT_KEY) {
    throw new Error("JWT secret keys (secret_key, faculty_key, student_key) must be defined in the environment variables.");
  }

  // 1. Check Admin Auth
  const adminToken = cookieStore.get("masterAdminauthToken")?.value;
  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, SECRET_KEY) as { _id: string };
      const admin = await MasterAdmin.findById(decoded._id);
      if (admin) {
        return {
          id: admin._id.toString(),
          email: admin.email,
          name: "Administrator",
          role: "admin",
        };
      }
    } catch (e) {
      console.warn("Invalid admin token");
    }
  }

  // 2. Check Faculty Auth
  const facultyToken = cookieStore.get("facultyToken")?.value;
  if (facultyToken) {
    try {
      const decoded = jwt.verify(facultyToken, FACULTY_KEY) as { _id: string };
      const faculty = await Faculty.findById(decoded._id);
      if (faculty) {
        return {
          id: faculty._id.toString(),
          email: faculty.email,
          name: faculty.name,
          role: "faculty",
          course: faculty.course,
        };
      }
    } catch (e) {
      console.warn("Invalid faculty token");
    }
  }

  // 3. Check Student Auth
  const studentToken = cookieStore.get("authToken")?.value;
  if (studentToken) {
    try {
      const decoded = jwt.verify(studentToken, STUDENT_KEY) as { _id: string };
      const student = await Student.findById(decoded._id);
      if (student) {
        return {
          id: student._id.toString(),
          email: student.email,
          name: student.name,
          role: "student",
          course: student.course,
          batch: student.batch,
        };
      }
    } catch (e) {
      console.warn("Invalid student token");
    }
  }

  return null;
}
