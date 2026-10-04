"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import type { Session, User, Announcement, Tent } from "../../types";

const GREEN  = "#0F4F3C";
const GREENS = ["#0F4F3C", "#1a7a5e", "#2aab84", "#6dd5b5", "#b2ead9"];

const EVENT_DAYS = [
  { label: "Thu 9 Jul",  iso: "2026-07-09" },
  { label: "Fri 10 Jul", iso: "2026-07-10" },
  { label: "Sat 11 Jul", iso: "2026-07-11" },
];

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-stone-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

interface Props {
  sessions:      Session[];
  users:         User[];
  announcements: Announcement[];
  tents:         Tent[];
}

export default function OverviewClient({ sessions, users, announcements, tents }: Props) {
  const totalLanguages = new Set(sessions.flatMap((s) => s.languages ?? []).filter(Boolean)).size;

  const sessionsPerDay = EVENT_DAYS.map((day) => ({
    day: day.label,
    sessions: sessions.filter((s) => s.startTime && toIsoDate(new Date(s.startTime)) === day.iso).length,
  }));

  const roleData = [
    { name: "Attendee",  value: users.filter((u) => u.role === "attendee").length },
    { name: "Organiser", value: users.filter((u) => u.role === "organiser").length },
    { name: "Admin",     value: users.filter((u) => u.role === "admin").length },
  ].filter((r) => r.value > 0);

  const regByDate: Record<string, number> = {};
  users.forEach((u) => {
    if (!u.createdAt) return;
    const d = toIsoDate(new Date(u.createdAt));
    regByDate[d] = (regByDate[d] || 0) + 1;
  });
  const registrationData = Object.entries(regByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { day: "numeric", month: "short", timeZone: "UTC" }),
      registrations: count,
    }));

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { icon: "📅", label: "Total Sessions",    value: sessions.length,      sub: `${totalLanguages} language${totalLanguages !== 1 ? "s" : ""}` },
          { icon: "👥", label: "Registered Users",  value: users.length,         sub: `${users.filter((u) => u.isActive).length} active` },
          { icon: "📢", label: "Announcements",     value: announcements.length, sub: "sent so far" },
          { icon: "🏕️", label: "Tents",             value: tents.length,         sub: "on the map" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <span className="text-2xl">{card.icon}</span>
            <p className="mt-3 text-sm font-medium text-stone-500">{card.label}</p>
            <p className="mt-1 text-4xl font-extrabold text-stone-900">{card.value}</p>
            <p className="mt-1 text-xs text-stone-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-extrabold text-stone-900">Sessions per Day</h2>
          <p className="mb-4 text-xs text-stone-400">Across all 3 event days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionsPerDay} barSize={40}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="sessions" name="Sessions" fill={GREEN} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-extrabold text-stone-900">Users by Role</h2>
          <p className="mb-4 text-xs text-stone-400">Breakdown of {users.length} registered users</p>
          {roleData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-stone-400">No users yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {roleData.map((_, i) => <Cell key={i} fill={GREENS[i % GREENS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {roleData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: GREENS[i % GREENS.length] }} />
                    <span className="text-sm text-stone-600">{r.name}</span>
                    <span className="ml-auto text-sm font-extrabold text-stone-900">{r.value}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 border-t border-stone-100 pt-2">
                  <span className="text-xs text-stone-400">Verified</span>
                  <span className="ml-auto text-xs font-bold text-stone-600">
                    {users.filter((u) => u.emailVerified).length} / {users.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registrations over time */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-extrabold text-stone-900">User Registrations</h2>
        <p className="mb-4 text-xs text-stone-400">Last 14 days</p>
        {registrationData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-stone-400">No registration data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="registrations" name="Registrations" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latest announcements */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-stone-900">Latest Announcements</h2>
        {recentAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-2xl">📢</p>
            <p className="mt-2 text-sm text-stone-400">No announcements sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                <p className="text-sm font-bold text-stone-900">{a.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{a.message}</p>
                <p className="mt-1 text-xs text-stone-400">{new Date(a.createdAt).toLocaleString('en-GB', { timeZone: "UTC" })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
