import { NextRequest, NextResponse } from "next/server";
import { validateAdmin, setAdminSession, clearAdminSession } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { valid, userId } = await validateAdmin(email, password);

    if (!valid || !userId) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await setAdminSession(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
