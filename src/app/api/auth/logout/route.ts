import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      isSuccess: true,
      message: "Logged out successfully",
    });

    // Clear all possible tokens
    response.cookies.set("masterAdminauthToken", "", { expires: new Date(0), path: "/" });
    response.cookies.set("facultyToken", "", { expires: new Date(0), path: "/" });
    response.cookies.set("authToken", "", { expires: new Date(0), path: "/" });

    return response;
  } catch (error: any) {
    console.error("Logout API Error:", error);
    return NextResponse.json({ isSuccess: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
