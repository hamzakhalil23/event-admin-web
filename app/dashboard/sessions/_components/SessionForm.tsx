"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ui/Toast";
import ImageUpload from "../../../../components/ui/ImageUpload";
import type { Session, Speaker } from "../../../../types";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

const EVENT_DATES = [
  { value: "2026-07-09", label: "Thursday, 9 July 2026" },
  { value: "2026-07-10", label: "Friday, 10 July 2026" },
  { value: "2026-07-11", label: "Saturday, 11 July 2026" },
];

function toLocalTimeStr(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toLocalDateStr(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildIsoTimes(dateStr: string, timeStr: string) {
  const parts = timeStr.split("-").map((t) => t.trim());
  const toIso = (t: string) => new Date(`${dateStr}T${t}:00`).toISOString();
  return { startTime: toIso(parts[0]), endTime: parts[1] ? toIso(parts[1]) : undefined };
}

interface Props {
  speakers: Speaker[];
  editSession?: Session | null;
  onCancelEdit?: () => void;
}

export default function SessionForm({ speakers, editSession, onCancelEdit }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const [title,       setTitle]       = useState(editSession?.title ?? "");
  const [speakerId,   setSpeakerId]   = useState(editSession?.speakerId ?? "");
  const [location,    setLocation]    = useState(editSession?.tent?.name ?? editSession?.location ?? "");
  const [language,    setLanguage]    = useState((editSession?.languages ?? [])[0] ?? "");
  const [date,        setDate]        = useState(editSession?.startTime ? toLocalDateStr(editSession.startTime) : "2026-07-09");
  const [time,        setTime]        = useState(() => {
    if (!editSession?.startTime) return "";
    const s = toLocalTimeStr(editSession.startTime);
    const e = editSession.endTime ? toLocalTimeStr(editSession.endTime) : "";
    return e ? `${s} - ${e}` : s;
  });
  const [description, setDescription] = useState(editSession?.description ?? "");
  const [imageUrl,    setImageUrl]    = useState(editSession?.imageUrl ?? "");

  const isEdit = !!editSession;

  const handleSave = async () => {
    if (!title || !location || !language || !date || !time) {
      toast.error("Title, location, language, date and time are required.");
      return;
    }
    setSaving(true);
    try {
      const { startTime, endTime } = buildIsoTimes(date, time);
      const body = {
        title,
        location,
        languages: [language],
        startTime,
        endTime,
        speakerId: speakerId || undefined,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
      };
      const path   = isEdit ? `/api/backend/session/${editSession.id}` : "/api/backend/session";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || "Failed to save session."); return; }
      toast.success(isEdit ? "Session updated." : "Session created.");
      if (onCancelEdit) onCancelEdit();
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-base font-extrabold text-stone-900">
        {isEdit ? "Edit Session" : "Create Session"}
      </h2>
      <p className="mb-5 text-sm text-stone-400">
        {isEdit ? "Update the fields below." : "Fill in details to add a new session."}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <input className={inputCls} placeholder="Session title *"           value={title}       onChange={(e) => setTitle(e.target.value)} />
        <select className={inputCls} value={speakerId} onChange={(e) => setSpeakerId(e.target.value)}>
          <option value="">No speaker</option>
          {speakers.map((sp) => (
            <option key={sp.id} value={sp.id}>{sp.title ? `${sp.title} ${sp.name}` : sp.name}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Tent / Location *"         value={location}    onChange={(e) => setLocation(e.target.value)} />
        <input className={inputCls} placeholder="Language e.g. English *"   value={language}    onChange={(e) => setLanguage(e.target.value)} />
        <select className={inputCls} value={date} onChange={(e) => setDate(e.target.value)}>
          {EVENT_DATES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <input className={inputCls} placeholder="Time e.g. 09:00 - 10:30 *" value={time}        onChange={(e) => setTime(e.target.value)} />
        <textarea className={`${inputCls} col-span-full min-h-24 resize-none`} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="col-span-full">
          <ImageUpload label="Session Image (optional)" value={imageUrl} onChange={setImageUrl} />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || isPending}
          className="rounded-xl bg-emerald-900 px-6 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : isPending ? "Refreshing…" : isEdit ? "Update Session" : "Create Session"}
        </button>
        {isEdit && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="rounded-xl border border-stone-200 bg-stone-100 px-6 py-3 text-sm font-bold text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}
