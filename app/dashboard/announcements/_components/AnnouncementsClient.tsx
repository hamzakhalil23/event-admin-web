"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ui/Toast";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import ImageUpload from "../../../../components/ui/ImageUpload";
import type { Announcement } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface Props {
  initialAnnouncements: Announcement[];
  languages: string[];
}

export default function AnnouncementsClient({ initialAnnouncements, languages }: Props) {
  const toast  = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sending,  setSending]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title,          setTitle]          = useState("");
  const [message,        setMessage]        = useState("");
  const [imageUrl,       setImageUrl]       = useState("");
  const [targetLanguage, setTargetLanguage] = useState("All");
  const [targetCountry,  setTargetCountry]  = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/backend/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          imageUrl:       imageUrl || undefined,
          targetLanguage: targetLanguage === "All" ? null : targetLanguage,
          targetCountry:  targetCountry.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || `Server error ${res.status}`); return; }
      toast.success("Announcement sent.");
      setTitle(""); setMessage(""); setImageUrl(""); setTargetLanguage("All"); setTargetCountry("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/backend/announcement/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete announcement."); return; }
      toast.success("Announcement deleted.");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Network error.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Announcement"
        message={`Delete "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Send form */}
      <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-extrabold text-stone-900">New Announcement</h2>
        <p className="mb-5 text-sm text-stone-400">Announcements appear instantly on users&apos; home screens.</p>
        <div className="grid gap-3">
          <input className={inputCls} placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={`${inputCls} min-h-28 resize-none`} placeholder="Message *" value={message} onChange={(e) => setMessage(e.target.value)} />
          <ImageUpload label="Announcement Image (optional)" value={imageUrl} onChange={setImageUrl} />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-stone-500">Target Language</label>
              <select className={inputCls} value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                {languages.map((l) => (
                  <option key={l} value={l}>{l === "All" ? "All languages" : l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-stone-500">Target Country (optional)</label>
              <input className={inputCls} placeholder="e.g. Malaysia — leave blank for all" value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} />
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || isPending}
            className="w-full rounded-xl bg-emerald-900 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending…" : isPending ? "Refreshing…" : "Send Announcement"}
          </button>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-4 text-base font-extrabold text-stone-900">
          History ({initialAnnouncements.length})
        </h2>
        {initialAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <p className="text-2xl">📢</p>
            <p className="mt-2 font-bold text-stone-700">No announcements yet</p>
            <p className="mt-1 text-sm text-stone-400">Send your first announcement above.</p>
          </div>
        ) : (
          <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
            {initialAnnouncements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-stone-900">{a.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{a.message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-500">
                        🌐 {a.targetLanguage || "All languages"}
                      </span>
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-500">
                        📍 {a.targetCountry || "All countries"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-stone-400">{new Date(a.createdAt).toLocaleString('en-GB', { timeZone: "UTC" })}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: a.id, title: a.title })}
                    className="shrink-0 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
