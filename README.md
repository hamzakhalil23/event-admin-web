# IjtemaApp — Admin Web Panel

Next.js 16 admin panel built for Al Khair Foundation's annual Ijtema event, used by organisers to manage sessions, speakers, tents and announcements for a live event serving hundreds of attendees. One of three components in the IjtemaApp system (mobile app, backend API, admin web), built as part of a small team.

## What this does

Organisers log in to create and edit the event schedule, manage speaker profiles, and keep a live map of venue tents up to date, all backed by a PostgreSQL database through the companion REST API.

## My contributions

- Refactored the login flow onto Next.js server actions with `useActionState`, removing client side JWT storage in `localStorage` (an XSS risk) in favour of HttpOnly cookies and a server rendered auth guard.
- Added a venue map (`components/TentMap.tsx`) using Leaflet and OpenStreetMap tiles, with full create, edit and delete for tents, synced live from the backend.
- Added the speaker management dropdown on the session form, replacing a free text field with a proper foreign key relationship to the speaker API.
- Server rendered the dashboard pages, added a centralised `lib/config.ts` for environment variables, fixed a hydration mismatch from unpinned locale and timezone formatting, and added error boundaries (`error.tsx`, `global-error.tsx`).
- Migrated hosting from Cloudflare to Railway.

## Tech stack

Next.js 16 (App Router, server actions), React 19, TypeScript, Tailwind CSS, Leaflet, Recharts.

## Running locally

```bash
npm install
npm run dev
```

Needs a `.env.local` pointing `NEXT_PUBLIC_API_URL` (or equivalent, see `lib/config.ts`) at a running instance of the backend API.

## Part of a team project

Built alongside a React Native mobile app and a Node/Express backend, with Daniyal Sohail as technical lead reviewing all merges to `main`. This repo is a personal copy of my contribution; the original, actively maintained repo lives under the Al Khair Foundation organisation.
