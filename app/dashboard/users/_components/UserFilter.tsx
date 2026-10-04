"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { User } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface Props {
  users: User[];
}

export default function UserFilter({ users }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const search     = searchParams.get("search")     ?? "";
  const filterRole = searchParams.get("filterRole") ?? "All";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 whenever a filter changes
      params.delete("page");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const roleCounts = {
    All:       users.length,
    admin:     users.filter((u) => u.role === "admin").length,
    organiser: users.filter((u) => u.role === "organiser").length,
    attendee:  users.filter((u) => u.role === "attendee").length,
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Role chips */}
      <div className="flex flex-wrap gap-3">
        {(["All", "admin", "organiser", "attendee"] as const).map((role) => (
          <button
            key={role}
            onClick={() => update("filterRole", role)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              filterRole === role
                ? "bg-emerald-900 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            {role === "All" ? "All" : role.charAt(0).toUpperCase() + role.slice(1)} ({roleCounts[role]})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        className={inputCls}
        placeholder="Search by name or email…"
        defaultValue={search}
        onChange={(e) => update("search", e.target.value)}
      />
    </div>
  );
}
