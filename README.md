# Team Knowledge Base

An internal, Notion-style knowledge base for employees and freelancers. Everyone sees only what their role allows; access is enforced in the database.

Stack: Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui, BlockNote, Supabase (Postgres, Auth, Storage), Claude API, hosted on Vercel. Full details are in [docs/BRIEFING.md](docs/BRIEFING.md); current status is in [docs/PROGRESS.md](docs/PROGRESS.md).

## Prerequisites

- Node.js 22.12 or newer (24 recommended), npm, git
- Access to the Supabase project and the Vercel project

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values, see below
npm run check:env            # OK/FAIL per setting, never prints values
npm run dev                  # http://localhost:3000
```

## Environment variables

`.env.local` is git-ignored. Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) go only into `.env.local` and the Vercel settings, never into chat or commits. The app validates all of them with zod at startup ([lib/env.ts](lib/env.ts)).

| Name                            | Comes from                                        | Secret |
| ------------------------------- | ------------------------------------------------- | ------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase, Project Settings, API Keys              | No     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key                          | No     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase secret key                               | Yes    |
| `ANTHROPIC_API_KEY`             | Anthropic Console (Phase 6)                       | Yes    |
| `ANTHROPIC_MODEL`               | Default `claude-sonnet-5-5`                       | No     |
| `APP_URL`                       | Deployed address, `http://localhost:3000` locally | No     |
| `MAX_VIDEO_MB`                  | Default 50                                        | No     |
| `AI_DAILY_LIMIT`                | Default 30                                        | No     |

## Commands

| Command             | What it does                                                                     |
| ------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`       | Start the app at http://localhost:3000                                           |
| `npm run check:env` | Validate `.env.local` and test both Supabase keys                                |
| `npm run typecheck` | TypeScript in strict mode                                                        |
| `npm run lint`      | ESLint                                                                           |
| `npm run format`    | Prettier (CI runs `format:check`)                                                |
| `npm test`          | Unit tests (Vitest)                                                              |
| `npm run build`     | Production build (`output: "standalone"`, ready for Docker)                      |
| `npm run test:e2e`  | Browser tests (Playwright) against a production build: run `npm run build` first |
| `npm run seed`      | Demo spaces and test users (Phase 2; refuses to run against production)          |

**Windows with Smart App Control:** Windows may block the native add-on Vitest's bundler uses ("An Application Control policy has blocked this file"), so `npm test` fails on such machines. Unit tests run in GitHub Actions on every push and pull request; everything else works locally.

## Continuous integration

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every push to `main` and every pull request: secret scan (gitleaks), typecheck, lint, format check, unit tests, build, a check that the secret key never reaches the browser bundle, and the Playwright tests.

## Deployment

Every push to `main` deploys to production on Vercel; pull requests get a preview deploy. `GET /api/health` answers `{"status":"ok"}` when the configuration is valid and Supabase is reachable (503 otherwise).

## Folder layout

```text
app/                 Next.js routes (pages, API routes)
components/          UI components (ui/ for shadcn)
lib/                 supabase clients, permissions helpers, ai, search, env, messages
scripts/             developer scripts (check-env)
supabase/migrations/ SQL migrations, one per change
supabase/tests/      SQL permission tests
tests/               unit/ (Vitest) and e2e/ (Playwright)
docs/                BRIEFING.md, PROGRESS.md, RUNBOOK.md, SELF_HOSTING.md, design/
```
