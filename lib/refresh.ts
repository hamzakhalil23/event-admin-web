import { cookies } from "next/headers";
import { config } from "./config";

/**
 * Reads the stored refresh_token cookie, calls /auth/refresh-token,
 * and if successful updates the admin_token cookie with the new access token.
 * Returns the new access token, or null if refresh fails.
 *
 * Used by the backend proxy route to silently recover from 401s.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${config.apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.accessToken) return null;

    cookieStore.set("admin_token", data.accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return data.accessToken;
  } catch {
    return null;
  }
}
