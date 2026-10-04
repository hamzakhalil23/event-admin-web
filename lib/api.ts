// Shared fetch wrapper for the admin panel.
// All requests are proxied through /api/proxy/... (a Next.js API route).
// The JWT token lives in an HttpOnly cookie — this file never touches it.
// The backend URL is a server-side env var — it is never exposed to the browser.

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`/api/backend${path}`, {
    ...options,
    headers,
    credentials: "include", // sends the HttpOnly cookie automatically
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_user");
      window.location.replace("/");
    }
    throw new Error("Session expired. Please sign in again.");
  }

  return res;
}
