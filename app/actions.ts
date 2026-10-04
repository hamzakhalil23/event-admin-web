"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "../lib/config";

export type LoginState =
  | { success: true }
  | { success: false; error: string }
  | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  try {
    const res = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Login failed. Check your credentials.",
      };
    }

    // Validate the user has an admin or organiser role
    if (!["admin", "organiser"].includes(data.user?.role)) {
      return { success: false, error: "Access denied. Admin account required." };
    }

    const cookieStore = await cookies();
    const isProd = config.nodeEnv === "production";

    // Access token — HttpOnly, 24h
    cookieStore.set("admin_token", data.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Refresh token — HttpOnly, 7d
    cookieStore.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Non-sensitive user info for layout (readable by client JS)
    cookieStore.set(
      "admin_user",
      JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }),
      {
        httpOnly: false,
        secure: isProd,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      },
    );
  } catch {
    return { success: false, error: "Unable to reach the server. Please try again." };
  }

  redirect("/dashboard");
}
