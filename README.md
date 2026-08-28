# RIDDANCE

> Remove Weakness. Build Discipline.

RIDDANCE is a full-stack TypeScript training log. It helps a runner stay
accountable by tracking every activity — runs, walks, rides, workouts,
sleep and meditation — and surfacing weekly totals and a daily streak.

## Features

- 🏃 Log activities (Run / Walk / Ride / Workout / Sleep / Meditation)
- 📏 Distance + duration per session (distance only where it makes sense)
- 📊 Dashboard: current streak, weekly activity count, weekly distance & time
- 🗂️ Per-type breakdown and filtering
- 🔌 Live API status indicator

### Planned

- Persistence with Prisma + PostgreSQL (currently in-memory)
- Strava import, journaling, AI coaching

## Tech Stack

**Frontend** — React 19, TypeScript, Vite
**Backend** — Node.js, Express 5, TypeScript, Zod, Pino
**Storage** — in-memory repository today; Prisma + PostgreSQL scaffolded for later

## Architecture

Layered and modular on both ends:

```
server/src
  config/       env validation (zod), logger
  middleware/   helmet, request logging, 404, error handler
  shared/       cross-cutting helpers (AppError, request params)
  modules/
    health/     routes → controller → service
    activities/ routes → controller → service → repository (+ stats, schemas, types)

client/src
  lib/                     http client, formatting helpers
  features/activities/
    api/         typed API client
    hooks/       useActivities, useApiStatus
    components/  ActivityForm, ActivityList, ActivityItem, StatsPanel
```

## Getting started

```bash
# from the repo root
npm install
npm --prefix server install
npm --prefix client install

npm run dev          # server on :5000, client on :3000 (proxies /api → :5000)
```

Copy `server/.env.example` to `server/.env` first.

## Scripts (root)

| Command | Description |
| --- | --- |
| `npm run dev` | Run client and server together |
| `npm run build` | Build server (`tsc`) and client (`tsc -b && vite build`) |
| `npm test` | Run the server test suite (Vitest) |
| `npm run type-check` | Type-check both packages |

## API

Base path: `/api/v1`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health |
| `GET` | `/activities` | List activities (`?type=Run` to filter) |
| `GET` | `/activities/stats` | Streak + weekly totals + per-type breakdown |
| `GET` | `/activities/:id` | Single activity |
| `POST` | `/activities` | Create (`type`, `title`, `date`, `durationMinutes`, `distanceKm?`, `notes?`) |
| `PATCH` | `/activities/:id` | Partial update |
| `DELETE` | `/activities/:id` | Delete |

## Status

🚧 In Development — data resets on server restart until Prisma is wired up.
