"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-4xl">⚠️</p>
      <p className="mt-4 text-lg font-bold text-stone-900">Something went wrong</p>
      <p className="mt-1 text-sm text-stone-500">
        {error.message || "Failed to load this page."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800"
      >
        Try again
      </button>
    </div>
  );
}
