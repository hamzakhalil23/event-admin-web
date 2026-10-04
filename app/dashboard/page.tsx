import { serverFetch } from "../../lib/server-fetch";
import type { Session, User, Announcement, Tent } from "../../types";
import OverviewClient from "./overview-client";

interface SessionsResponse      { success: boolean; data: Session[] }
interface UsersResponse         { success: boolean; data: User[] }
interface AnnouncementsResponse { success: boolean; data?: Announcement[]; announcements?: Announcement[] }
interface TentsResponse         { success: boolean; tents: Tent[] }

export default async function OverviewPage() {
  const [sessionsRes, usersRes, announcementsRes, tentsRes] = await Promise.all([
    serverFetch<SessionsResponse>("/session"),
    serverFetch<UsersResponse>("/user?limit=500"),
    serverFetch<AnnouncementsResponse>("/announcement"),
    serverFetch<TentsResponse>("/tent"),
  ]);

  if (!sessionsRes?.success && !usersRes?.success && !announcementsRes?.success && !tentsRes?.success) {
    throw new Error("Failed to load dashboard data");
  }

  const sessions      = sessionsRes?.data ?? [];
  const users         = usersRes?.data ?? [];
  const announcements = announcementsRes?.data ?? announcementsRes?.announcements ?? [];
  const tents         = tentsRes?.tents ?? [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Ijtima</p>
        <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Overview</h1>
        <p className="mt-1 text-stone-500">Event at a glance</p>
      </div>
      <OverviewClient
        sessions={sessions}
        users={users}
        announcements={announcements}
        tents={tents}
      />
    </div>
  );
}
