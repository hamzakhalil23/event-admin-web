import { NextRequest, NextResponse } from "next/server";
import { config as appConfig } from "./lib/config";

/**
 * Decodes the JWT payload (no signature verification — that's the backend's job).
 * Returns the `exp` field in seconds, or null if the token can't be decoded.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const token        = req.cookies.get("admin_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // No tokens at all → redirect to login
  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If we have a token, check whether it has expired (or is within 60s of expiry)
  if (token) {
    const exp          = getTokenExpiry(token);
    const nowSecs      = Math.floor(Date.now() / 1000);
    const stillValid   = exp !== null && exp - nowSecs >= 60;

    if (stillValid) {
      return NextResponse.next();
    }
  }

  // Token is missing or expired — try to refresh
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const res  = await fetch(`${appConfig.apiUrl}/auth/refresh-token`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    const data = await res.json();

    if (!res.ok || !data.success || !data.accessToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Refresh succeeded — set the new access token and proceed
    const response = NextResponse.next();
    response.cookies.set("admin_token", data.accessToken, {
      httpOnly: true,
      secure:   appConfig.nodeEnv === "production",
      sameSite: "strict",
      maxAge:   60 * 60 * 24,
      path:     "/",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
