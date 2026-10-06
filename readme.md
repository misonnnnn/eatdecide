# EatDecide

**Stop thinking. Start eating.**

A simple, fun web app that helps you decide what to eat based on group size, budget, cravings, and mood.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- MySQL + Prisma
- Framer Motion (light animations)

## Setup

1. Make sure **MySQL** is running (Laragon is fine).

2. Copy the env file and adjust if needed:

```bash
cp .env.example .env
```

Default connection (Laragon root, no password):

```
DATABASE_URL="mysql://root@localhost:3306/eatdecide"
```

3. Create the database (if it does not exist yet):

```sql
CREATE DATABASE eatdecide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Install dependencies, run migrations, and seed foods:

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

5. Start the app:

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
2. Questions: people → budget → food prefs → mood
3. Short shuffle animation
4. Result with estimated cost, suggested order, and per-person split

Recommendation logic lives in `src/lib/recommendation.ts` — simple scoring, no AI.

Prices are **estimates only**, not live restaurant prices.
