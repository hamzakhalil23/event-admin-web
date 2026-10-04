"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Session } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface Props {
  sessions: Session[];
}

export default function SessionFilter({ sessions }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const languages = ["All", ...Array.from(new Set(sessions.flatMap((s) => s.languages).filter(Boolean)))];
  const tentNames = ["All", ...Array.from(new Set(sessions.map((s) => s.tent?.name ?? s.location).filter(Boolean)))];

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <input
        className={inputCls}
        placeholder="Search sessions…"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => update("search", e.target.value)}
      />
      <select
        className={inputCls}
        value={searchParams.get("language") ?? "All"}
        onChange={(e) => update("language", e.target.value === "All" ? "" : e.target.value)}
      >
        {languages.map((l) => <option key={l} value={l}>{l === "All" ? "All languages" : l}</option>)}
      </select>
      <select
        className={inputCls}
        value={searchParams.get("tent") ?? "All"}
        onChange={(e) => update("tent", e.target.value === "All" ? "" : e.target.value)}
      >
        {tentNames.map((t) => <option key={t} value={t}>{t === "All" ? "All tents" : t}</option>)}
      </select>
    </div>
  );
}
