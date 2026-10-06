# EatDecide

**Stop thinking. Start eating.**

A simple, fun web app that helps you decide what to eat based on group size, budget, cravings, mood, and **nearby restaurants**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- MySQL + Prisma
- Google Places API (server-side)
- Browser Geolocation API
- Framer Motion (light animations)

## Setup

1. Make sure **MySQL** is running (Laragon is fine).

2. Copy the env file and adjust if needed:

```bash
cp .env.example .env.local
```

Also copy or merge into `.env` if you use that file locally.

```env
DATABASE_URL="mysql://root@localhost:3306/eatdecide"
GOOGLE_MAPS_API_KEY=your_server_key_here
```

3. **Google Maps Platform**

   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable **Places API (New)**
   - Create an API key restricted to server use (IP or API restriction for Places)
   - Put the key in `.env.local` as `GOOGLE_MAPS_API_KEY`

   The key is only used in Next.js API routes — never in React components.

4. Create the database (if needed):

```sql
CREATE DATABASE eatdecide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Install, migrate, and seed:

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Re-seed food data |
| `npm run db:studio` | Open Prisma Studio |

## How it works

1. Homepage → Surprise Me or Help Me Choose
2. Questions: people → budget → food prefs → mood → **location (optional)**
3. Server searches Google Places once (5 km, then 10 km if needed)
4. Simple scoring picks food + best nearby restaurant
5. Result: restaurant card, estimates, split, directions, try another

Logic lives in:

- `src/lib/recommendation.ts` — food + restaurant scoring
- `src/lib/places.ts` — Google Places (server)
- `src/lib/distance.ts` — Haversine distance

**Try Another** reuses cached restaurant results in `sessionStorage` to avoid extra API calls.

Restaurant **names/ratings/location** come from Google. **Prices** are EatDecide estimates from the food database — not live menu prices.

Location is **not stored in MySQL** — only used for the current session search.
