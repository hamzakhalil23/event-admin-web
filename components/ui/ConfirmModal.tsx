"use client";

import { useEffect } from "react";

interface Props {
  open:          boolean;
  title:         string;
  message:       string;
  confirmLabel?: string;
  danger?:       boolean;
  loading?:      boolean;
  onConfirm:     () => void;
  onCancel:      () => void;
}

export default function ConfirmModal({
  open, title, message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm, onCancel,
}: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* Icon */}
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg
          ${danger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
          {danger ? "!" : "?"}
        </div>

        <h3 className="text-base font-extrabold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-stone-200 bg-stone-100 px-5 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-sm font-extrabold text-white transition-opacity disabled:opacity-50
              ${danger ? "bg-red-500 hover:bg-red-600" : "bg-emerald-900 hover:opacity-90"}`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
