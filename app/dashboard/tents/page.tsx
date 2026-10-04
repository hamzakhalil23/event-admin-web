import { serverFetch } from "../../../lib/server-fetch";
import type { Tent } from "../../../types";
import TentsClient from "./_components/TentsClient";

interface TentsResponse { success: boolean; tents: Tent[] }

export default async function TentsPage() {
  const result = await serverFetch<TentsResponse>("/tent");

  if (!result?.success) {
    throw new Error("Failed to load tents");
  }

  const tents = result.tents ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Manage</p>
        <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Tents</h1>
        <p className="mt-1 text-stone-500">{tents.length} tent{tents.length !== 1 ? "s" : ""} configured</p>
      </div>
      <TentsClient initialTents={tents} />
    </div>
  );
}
