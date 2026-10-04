"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ui/Toast";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import ImageUpload from "../../../../components/ui/ImageUpload";
import type { Speaker } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface Props {
  initialSpeakers: Speaker[];
}

export default function SpeakersClient({ initialSpeakers }: Props) {
  const toast  = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);

  const [name,     setName]     = useState("");
  const [title,    setTitle]    = useState("");
  const [bio,      setBio]      = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => { setEditId(null); setName(""); setTitle(""); setBio(""); setImageUrl(""); };

  const handleEdit = (sp: Speaker) => {
    setEditId(sp.id);
    setName(sp.name ?? "");
    setTitle(sp.title ?? "");
    setBio(sp.bio ?? "");
    setImageUrl(sp.imageUrl ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const body = { name: name.trim(), title: title.trim() || undefined, bio: bio.trim() || undefined, imageUrl: imageUrl || undefined };
      const path   = editId ? `/api/backend/speaker/${editId}` : "/api/backend/speaker";
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data   = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || `Server error ${res.status}`); return; }
      toast.success(editId ? "Speaker updated." : "Speaker created.");
      resetForm();
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/backend/speaker/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete speaker."); return; }
      toast.success("Speaker deleted.");
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
        title="Delete Speaker"
        message={`Delete "${confirmDelete?.name}"? Sessions assigned to this speaker will lose their speaker.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-extrabold text-stone-900">{editId ? "Edit Speaker" : "New Speaker"}</h2>
        <p className="mb-5 text-sm text-stone-400">
          {editId ? "Update the speaker details below." : "Speaker will be available to assign to sessions."}
        </p>
        <div className="grid gap-3">
          <input className={inputCls} placeholder="Full name *" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="Title / role (e.g. Imam, Scholar)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={`${inputCls} min-h-24 resize-none`} placeholder="Short bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />
          <ImageUpload label="Speaker Photo (optional)" value={imageUrl} onChange={setImageUrl} />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || isPending}
              className="flex-1 rounded-xl bg-emerald-900 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (editId ? "Saving…" : "Creating…") : isPending ? "Refreshing…" : editId ? "Save Changes" : "Create Speaker"}
            </button>
            {editId && (
              <button onClick={resetForm} className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-extrabold text-stone-900">Speakers ({initialSpeakers.length})</h2>
        {initialSpeakers.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <p className="text-2xl">🎙️</p>
            <p className="mt-2 font-bold text-stone-700">No speakers yet</p>
            <p className="mt-1 text-sm text-stone-400">Create your first speaker above.</p>
          </div>
        ) : (
          <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
            {initialSpeakers.map((sp) => (
              <div key={sp.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  {sp.imageUrl ? (
                    <img src={sp.imageUrl} alt={sp.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-extrabold text-emerald-700">
                      {sp.name?.[0]?.toUpperCase() ?? "S"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-stone-900">{sp.name}</p>
                    {sp.title && <p className="text-sm text-emerald-700 font-semibold">{sp.title}</p>}
                    {sp.bio   && <p className="mt-1 text-sm text-stone-500 line-clamp-2">{sp.bio}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => handleEdit(sp)} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50">Edit</button>
                    <button onClick={() => setConfirmDelete({ id: sp.id, name: sp.name })} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
