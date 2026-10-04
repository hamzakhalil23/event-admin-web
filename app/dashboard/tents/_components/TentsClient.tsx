"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ui/Toast";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import type { Tent } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface Props {
  initialTents: Tent[];
}

export default function TentsClient({ initialTents }: Props) {
  const toast  = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [name,    setName]    = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => { setEditId(null); setName(""); };

  const handleEdit = (tent: Tent) => {
    setEditId(tent.id);
    setName(tent.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Tent name is required."); return; }
    setSaving(true);
    try {
      const path   = editId ? `/api/backend/tent/${editId}` : "/api/backend/tent";
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const data   = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || "Failed to save tent."); return; }
      toast.success(editId ? "Tent updated." : "Tent created.");
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
      const res = await fetch(`/api/backend/tent/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete tent."); return; }
      toast.success(`"${confirmDelete.name}" deleted.`);
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
        title="Delete Tent"
        message={`Delete "${confirmDelete?.name}"? Sessions linked to this tent will lose their tent assignment.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-extrabold text-stone-900">{editId ? "Edit Tent" : "Add Tent"}</h2>
        <p className="mb-5 text-sm text-stone-400">
          {editId ? "Update the tent name below." : "Create a new tent to assign sessions to."}
        </p>
        <div className="flex gap-3">
          <input
            className={inputCls}
            placeholder="Tent name e.g. Main Tent *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving || isPending}
            className="shrink-0 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : editId ? "Update" : "Add Tent"}
          </button>
          {editId && (
            <button onClick={resetForm} className="shrink-0 rounded-xl border border-stone-200 bg-stone-100 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-200">
              Cancel
            </button>
          )}
        </div>
      </section>

      {initialTents.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="text-2xl">🏕️</p>
          <p className="mt-2 font-bold text-stone-700">No tents yet</p>
          <p className="mt-1 text-sm text-stone-400">Add your first tent above.</p>
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
          {initialTents.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="font-extrabold text-stone-900">{t.name}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {t.sessions?.length ?? 0} session{(t.sessions?.length ?? 0) !== 1 ? "s" : ""}
                  {(t.pois?.length ?? 0) > 0 ? ` · ${t.pois!.length} POI${t.pois!.length !== 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(t)} className="rounded-xl bg-emerald-900 px-4 py-2 text-xs font-bold text-white hover:opacity-90">Edit</button>
                <button onClick={() => setConfirmDelete({ id: t.id, name: t.name })} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
