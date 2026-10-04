import { Suspense } from "react";
import { serverFetch } from "../../../lib/server-fetch";
import type { Session, Speaker } from "../../../types";
import SessionForm from "./_components/SessionForm";
import SessionFilter from "./_components/SessionFilter";
import SessionList from "./_components/SessionList";

interface SessionsResponse { success: boolean; data: Session[] }
interface SpeakersResponse { success: boolean; data: Speaker[] }

export default async function SessionsPage() {
  const [sessionsRes, speakersRes] = await Promise.all([
    serverFetch<SessionsResponse>("/session"),
    serverFetch<SpeakersResponse>("/speaker"),
  ]);

  if (!sessionsRes?.success) {
    throw new Error("Failed to load sessions");
  }

  const sessions = sessionsRes.data ?? [];
  const speakers = speakersRes?.data ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Manage</p>
        <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Sessions</h1>
        <p className="mt-1 text-stone-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""} total</p>
      </div>

      <Suspense>
        <SessionForm speakers={speakers} />
        <SessionFilter sessions={sessions} />
        <SessionList sessions={sessions} speakers={speakers} />
      </Suspense>
    </div>
  );
}
