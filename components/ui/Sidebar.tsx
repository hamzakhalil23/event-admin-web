"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Overview",      href: "/dashboard",               icon: "◈" },
  { label: "Sessions",      href: "/dashboard/sessions",      icon: "▦" },
  { label: "Speakers",      href: "/dashboard/speakers",      icon: "🎙" },
  { label: "Users",         href: "/dashboard/users",         icon: "◉" },
  { label: "Announcements", href: "/dashboard/announcements", icon: "◎" },
  { label: "Tents",         href: "/dashboard/tents",         icon: "◬" },
];

interface Props {
  user: { name: string; email: string; role: string };
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-56 flex-col bg-emerald-900">
      {/* Brand */}
      <div className="border-b border-emerald-800 px-6 py-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
          Ijtima
        </span>
        <p className="mt-0.5 text-base font-extrabold text-white">Admin Panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-emerald-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base leading-none">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-emerald-800 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-extrabold text-white">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="text-xs capitalize text-emerald-400">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-emerald-700 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-800 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
