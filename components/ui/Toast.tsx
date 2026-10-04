"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  leaving: boolean;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error:   (msg: string) => void;
  info:    (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};

const COLORS: Record<ToastType, string> = {
  success: "bg-emerald-800 border-emerald-700",
  error:   "bg-red-600   border-red-500",
  info:    "bg-stone-700 border-stone-600",
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-semibold text-white shadow-xl
        transition-all duration-300 ease-out
        ${item.leaving ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100"}
        ${COLORS[item.type]}`}
    >
      <span className="text-base leading-none">{ICONS[item.type]}</span>
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="ml-1 rounded-full opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    // Trigger leave animation then remove
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const ctx: ToastContextValue = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    info:    (msg) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
