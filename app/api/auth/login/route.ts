import { NextRequest, NextResponse } from "next/server";
import { config } from "../../../../lib/config";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  let data: any;
  try {
    const res = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Login failed. Check your credentials." },
        { status: res.status },
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the server." },
      { status: 503 },
    );
  }

  const user = data.user;
  if (user.role !== "admin" && user.role !== "organiser") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin or organiser account required." },
      { status: 403 },
    );
  }

  // Set the token in an HttpOnly cookie — JS on the page can never read it
  const response = NextResponse.json({ success: true, user });
  response.cookies.set("admin_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
