# Team Knowledge Base

An internal, Notion-style knowledge base for employees and freelancers. Everyone sees only what their role allows; access is enforced in the database.

Stack: Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, BlockNote, Supabase (Postgres, Auth, Storage), Claude API, hosted on Vercel. Full details are in [docs/BRIEFING.md](docs/BRIEFING.md); current status is in [docs/PROGRESS.md](docs/PROGRESS.md).

> Status: Phase 0 (accounts and tools). The app code arrives in Phase 1, and this README will grow with it.

## Prerequisites

- Node.js 20 or newer, npm, git
- Access to the Supabase project and (later) the Vercel project

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is git-ignored. Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) go only into `.env.local` and the Vercel settings, never into chat or commits.

| Name | Comes from | Secret |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project Settings, API Keys | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Console (Phase 6) | Yes |
| `ANTHROPIC_MODEL` | Default `claude-sonnet-5-5` | No |
| `APP_URL` | Deployed address, `http://localhost:3000` locally | No |
| `MAX_VIDEO_MB` | Default 50 | No |
| `AI_DAILY_LIMIT` | Default 30 | No |

## Commands (from Phase 1 on)

- `npm run dev` – start the app at http://localhost:3000
- `npm run check:env` – check that all required settings are present, without printing them
- `npm run seed` – demo spaces and test users (refuses to run against production)
- `npm test` – unit, permission and end-to-end tests

## Deployment

Every push to `main` deploys to production on Vercel; pull requests get a preview deploy.

## Folder layout

```text
app/                 Next.js routes (pages, API routes)
components/          UI components (ui/ for shadcn)
lib/                 supabase clients, permissions helpers, ai, search, env
supabase/migrations/ SQL migrations, one per change
supabase/tests/      SQL permission tests
tests/               Vitest and Playwright
docs/                BRIEFING.md, PROGRESS.md, RUNBOOK.md, SELF_HOSTING.md, design/
```
