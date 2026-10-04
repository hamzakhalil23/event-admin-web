"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../../components/ui/Toast";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import SessionForm from "./SessionForm";
import type { Session, Speaker } from "../../../../types";

function formatTime(session: Session) {
  if (!session.startTime) return "Time TBC";
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const start = new Date(session.startTime).toLocaleTimeString('en-GB', { ...opts, timeZone: "UTC" });
  if (!session.endTime) return start;
  return `${start} – ${new Date(session.endTime).toLocaleTimeString('en-GB', { ...opts, timeZone: "UTC" })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

interface Props {
  sessions: Session[];
  speakers: Speaker[];
}

export default function SessionList({ sessions, speakers }: Props) {
  const toast  = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [editSession,   setEditSession]   = useState<Session | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  const search   = searchParams.get("search")   ?? "";
  const language = searchParams.get("language") ?? "";
  const tent     = searchParams.get("tent")     ?? "";

  const filtered = sessions.filter((s) => {
    const q        = search.toLowerCase();
    const tentName = s.tent?.name ?? s.location ?? "";
    return (
      (!search   || s.title?.toLowerCase().includes(q) || tentName.toLowerCase().includes(q)) &&
      (!language || (s.languages ?? []).includes(language)) &&
      (!tent     || tentName === tent)
    );
  });

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/backend/session/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete session."); return; }
      toast.success(`"${confirmDelete.title}" deleted.`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Network error.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (editSession) {
    return (
      <SessionForm
        speakers={speakers}
        editSession={editSession}
        onCancelEdit={() => setEditSession(null)}
      />
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Session"
        message={`Delete "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="text-2xl">📅</p>
          <p className="mt-2 font-bold text-stone-700">No sessions found</p>
          <p className="mt-1 text-sm text-stone-400">
            {search || language || tent ? "Try adjusting your search or filters." : "Create your first session above."}
          </p>
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
          {filtered.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-stone-900">{s.title}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {s.tent?.name ?? s.location ?? "—"} &bull; {(s.languages ?? []).join(", ") || "—"}
                  {s.speaker?.name ? ` · ${s.speaker.name}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {s.startTime ? `${formatDate(s.startTime)} · ${formatTime(s)}` : "Time TBC"}
                </p>
                {s.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-stone-400">{s.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditSession(s)} className="rounded-xl bg-emerald-900 px-4 py-2 text-xs font-bold text-white hover:opacity-90">Edit</button>
                <button onClick={() => setConfirmDelete({ id: s.id, title: s.title })} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
