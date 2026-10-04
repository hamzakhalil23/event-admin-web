import { serverFetch } from "../../../lib/server-fetch";
import type { Speaker } from "../../../types";
import SpeakersClient from "./_components/SpeakersClient";

interface SpeakersResponse { success: boolean; data: Speaker[] }

export default async function SpeakersPage() {
  const result = await serverFetch<SpeakersResponse>("/speaker");

  if (!result?.success) {
    throw new Error("Failed to load speakers");
  }

  const speakers = result.data ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Manage</p>
        <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Speakers</h1>
        <p className="mt-1 text-stone-500">Add speakers and assign them to sessions</p>
      </div>
      <SpeakersClient initialSpeakers={speakers} />
    </div>
  );
}
