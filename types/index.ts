// ── User ──────────────────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
};

export type UserMeta = {
  id: number;
  limit: number;
  page: number;
};

// ── Speaker ──────────────────────────────────────────────────────
export type Speaker = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
};

// ── Tent ─────────────────────────────────────────────────────────
export type Tent = {
  id: string;
  name: string;
  sessions?: Session[];
  pois?: { id: string; name: string }[];
};

// ── Session ──────────────────────────────────────────────────────
export type Session = {
  id: string;
  title: string;
  location: string;
  languages: string[];
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  speakerId?: string | null;
  speaker?: Speaker | null;
  tent?: Tent | null;
  createdAt: string;
};

// ── Announcement ─────────────────────────────────────────────────
export type Announcement = {
  id: string;
  title: string;
  message: string;
  imageUrl?: string | null;
  targetLanguage?: string | null;
  targetCountry?: string | null;
  createdAt: string;
};

// ── Auth ─────────────────────────────────────────────────────────
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};
