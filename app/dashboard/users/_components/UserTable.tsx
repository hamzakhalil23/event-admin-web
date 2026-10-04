"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { useToast } from "../../../../components/ui/Toast";
import type { User } from "../../../../types";

const PAGE_SIZE = 20;

const ROLES = ["attendee", "organiser", "admin"] as const;

const ROLE_COLORS: Record<string, string> = {
  admin:     "bg-emerald-100 text-emerald-800",
  organiser: "bg-blue-100 text-blue-800",
  attendee:  "bg-stone-100 text-stone-600",
};

interface Props {
  users: User[];
}

export default function UserTable({ users }: Props) {
  const toast        = useToast();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search     = searchParams.get("search")     ?? "";
  const filterRole = searchParams.get("filterRole") ?? "All";
  const page       = Number(searchParams.get("page") ?? "1");

  const [changingRole, setChangingRole] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) &&
      (filterRole === "All" || u.role === filterRole)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      const res  = await fetch(`/api/backend/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || "Failed to update role."); return; }
      toast.success(`Role updated to ${newRole}.`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Network error.");
    } finally {
      setChangingRole(null);
    }
  };

  if (paginated.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <p className="text-2xl">👥</p>
        <p className="mt-2 font-bold text-stone-700">No users found</p>
        <p className="mt-1 text-sm text-stone-400">
          {search || filterRole !== "All" ? "Try adjusting your search or filter." : "No users have registered yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <div className="grid grid-cols-[1fr_1fr_160px_auto_auto] gap-4 border-b border-stone-100 bg-stone-50 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-stone-400">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Verified</span>
          <span>Active</span>
        </div>

        {paginated.map((u, i) => (
          <div
            key={u.id}
            className={`grid grid-cols-[1fr_1fr_160px_auto_auto] items-center gap-4 px-5 py-4 text-sm ${
              i < paginated.length - 1 ? "border-b border-stone-100" : ""
            }`}
          >
            <div>
              <p className="font-bold text-stone-900">{u.name}</p>
              {u.lastLoginAt && (
                <p className="text-xs text-stone-400">
                  Last login: {new Date(u.lastLoginAt).toLocaleDateString('en-GB', { timeZone: "UTC" })}
                </p>
              )}
            </div>
            <span className="truncate text-stone-600">{u.email}</span>

            <select
              value={u.role ?? "attendee"}
              disabled={changingRole === u.id}
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold capitalize outline-none transition-opacity disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-emerald-100 ${
                ROLE_COLORS[u.role ?? "attendee"] ?? "bg-stone-100 text-stone-600"
              } border-transparent`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>

            <span className={`text-xs font-bold ${u.emailVerified ? "text-emerald-600" : "text-stone-400"}`}>
              {u.emailVerified ? "✓" : "✗"}
            </span>
            <span className={`text-xs font-bold ${u.isActive ? "text-emerald-600" : "text-red-400"}`}>
              {u.isActive ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-stone-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >
              ← Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
