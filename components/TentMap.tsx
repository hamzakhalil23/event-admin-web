"use client";

// TentMap — Leaflet map of the venue with tent list loaded from the PostgreSQL API.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import { useToast } from "./ui/Toast";
import ConfirmModal from "./ui/ConfirmModal";

const VENUE_CENTER: [number, number] = [52.1268, 1.1068];

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export type Tent = {
  id: string;
  name: string;
  sessions?: any[];
  pois?: any[];
};

export default function TentMap() {
  const toast = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<any>(null);

  const [tents,         setTents]         = useState<Tent[]>([]);
  const [name,          setName]          = useState("");
  const [editId,        setEditId]        = useState<string | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  // ── Fetch tents ───────────────────────────────────────────────────────────
  const fetchTents = useCallback(async () => {
    try {
      const res  = await apiFetch("/tent");
      const data = await res.json();
      if (data.success) setTents(data.tents || []);
    } catch {
      toast.error("Failed to fetch tents.");
    }
  }, []);

  useEffect(() => { fetchTents(); }, [fetchTents]);

  // ── Load Leaflet map (client-only) ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current!).setView(VENUE_CENTER, 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 20,
      }).addTo(map);

      L.marker(VENUE_CENTER)
        .addTo(map)
        .bindPopup("<b>Shrublands Hall</b><br>Event venue")
        .openPopup();

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Tent name is required.");
      return;
    }
    setSaving(true);
    try {
      const path   = editId ? `/tent/${editId}` : "/tent";
      const method = editId ? "PUT" : "POST";
      const res    = await apiFetch(path, {
        method,
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to save tent.");
        return;
      }
      setName(""); setEditId(null);
      fetchTents();
    } catch (err: any) {
      toast.error(`Network error: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/tent/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete tent.");
        return;
      }
      if (editId === confirmDelete.id) { setEditId(null); setName(""); }
      toast.success(`Tent "${confirmDelete.name}" deleted.`);
      fetchTents();
    } catch {
      toast.error("Network error.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Tent"
        message={`Delete tent "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ height: 380, borderRadius: 16, overflow: "hidden", border: "1px solid #e7e5e4" }}
      />

      {/* Add / edit form */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-extrabold text-stone-900">
          {editId ? "Edit Tent" : "Add Tent"}
        </h3>
        <div className="flex gap-3">
          <input
            className={inputCls}
            placeholder="Tent name e.g. Main English Tent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setName(""); }}
              className="shrink-0 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-200"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Tent list */}
      {tents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-stone-700">
            Tents ({tents.length})
          </h3>
          {tents.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <span className="text-sm font-bold text-stone-900">{t.name}</span>
                <span className="ml-2 text-xs text-stone-400">
                  {t.sessions?.length ?? 0} session{(t.sessions?.length ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditId(t.id); setName(t.name); }}
                  className="rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: t.id, name: t.name })}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
