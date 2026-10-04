import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { config } from "../../../../lib/config";
import { refreshAccessToken } from "../../../../lib/refresh";

async function forwardToBackend(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  return fetch(url, { method, headers, body: body as BodyInit | undefined });
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const cookieStore = await cookies();
  let token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const backendUrl = new URL(`/${path.join("/")}${new URL(req.url).search}`, config.apiUrl).toString();

  // Preserve Content-Type (important for multipart/form-data boundaries)
  const contentType = req.headers.get("content-type");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };

  // Read body into buffer once so it can be re-used on retry
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  try {
    let backendRes = await forwardToBackend(backendUrl, req.method, headers, body);

    // Token expired mid-session — try to refresh once and retry the request
    if (backendRes.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        backendRes = await forwardToBackend(backendUrl, req.method, headers, body);
      }
    }

    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reach the server." },
      { status: 503 },
    );
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const DELETE = handler;
export const PATCH  = handler;
