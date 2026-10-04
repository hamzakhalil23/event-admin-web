import { cookies } from "next/headers";
import { config } from "./config";
import { refreshAccessToken } from "./refresh";

/**
 * Server-side authenticated fetch.
 * Reads admin_token from cookies, adds Authorization header, calls the backend.
 * If the response is 401, attempts a token refresh and retries once.
 * Returns parsed JSON data, or null on failure.
 */
export async function serverFetch<T = unknown>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  const url = new URL(path, config.apiUrl);

  const doFetch = (t: string) =>
    fetch(url, {
      headers: { Authorization: `Bearer ${t}` },
      cache: "no-store",
    });

  try {
    let res = await doFetch(token);

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      res = await doFetch(newToken);
    }

    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}
