import { serverFetch } from "../../../lib/server-fetch";
import type { Announcement, Session } from "../../../types";
import AnnouncementsClient from "./_components/AnnouncementsClient";

interface AnnouncementsResponse { success: boolean; data?: Announcement[]; announcements?: Announcement[] }
interface SessionsResponse      { success: boolean; data: Session[] }

export default async function AnnouncementsPage() {
  const [announcementsRes, sessionsRes] = await Promise.all([
    serverFetch<AnnouncementsResponse>("/announcement"),
    serverFetch<SessionsResponse>("/session"),
  ]);

  if (!announcementsRes?.success) {
    throw new Error("Failed to load announcements");
  }

  const announcements = announcementsRes.data ?? announcementsRes.announcements ?? [];
  const sessions      = sessionsRes?.data ?? [];
  const languages     = ["All", ...Array.from(new Set(sessions.flatMap((s) => s.languages).filter(Boolean)))];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Manage</p>
        <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Announcements</h1>
        <p className="mt-1 text-stone-500">Send targeted messages to mobile app users</p>
      </div>
      <AnnouncementsClient initialAnnouncements={announcements} languages={languages} />
    </div>
  );
}
