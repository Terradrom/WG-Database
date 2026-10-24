# Progress

Current phase: **Phase 1 – Foundation and first deployment**

## Done

- 2026-10-23: Computer checked: Node v24.15.0, npm 11.12.1, git 2.54.0 (all OK).
- 2026-10-23: Project folder created with the layout from the briefing (`app/`, `components/ui/`, `lib/`, `supabase/migrations/`, `supabase/tests/`, `tests/`, `docs/design/`).
- 2026-10-23: `docs/BRIEFING.md`, `CLAUDE.md`, `.env.example`, empty git-ignored `.env.local`, `.gitignore`, `README.md` created.
- 2026-10-23: Owner step 0.1 done: private repository https://github.com/Terradrom/WG-Database, first commit pushed to `main`.
- 2026-10-23: Owner step 0.2 done: Supabase project "Werbegeschenk Database" created.
- 2026-10-23: Owner step 0.3 done: Project URL (https://xdkpifmpfnntrhqvdouu.supabase.co), publishable key and secret key in `.env.local`. `node scripts/check-env.mjs` passes, including a live check that the project accepts both keys. The secret key works on the Auth admin API (0 users so far).

- 2026-10-23: Owner step 0.4 done: public sign-up switched off, Site URL `http://localhost:3000`, Redirect URL `http://localhost:3000/**`. Verified: a sign-up attempt through the API is refused (HTTP 422 `signup_disabled`), Email provider still on, 0 users in the project.
- 2026-10-23: **Checkpoint 0 reached.**
- 2026-10-23: Phase 1 code built on branch `feat/phase-1-foundation`: Next.js 16.4 (App Router, TypeScript strict, `output: "standalone"`), Tailwind 4 with the briefing's design tokens, shadcn/ui, lucide, Inter; zod env validation (`lib/env.ts`, checked at startup and by `npm run check:env`); Supabase clients for browser, server and admin (admin is `server-only` and lint-blocked from client code); `/api/health`; strings in `lib/messages.ts`; placeholder login page; ESLint + Prettier; Vitest; Playwright (desktop and 390×844); GitHub Actions CI with gitleaks secret scan and a check that the secret key never reaches the browser bundle.
- 2026-10-23: Verified locally: typecheck, lint, format, build, 6/6 Playwright tests, check:env against the real project, `/api/health` returns ok. 0 vulnerabilities in production dependencies.

## Next

- CI green on the pull request, then merge to `main`.
- Owner step 1.1: connect Vercel. Owner step 1.2: live address in Supabase.
- Checkpoint 1: live login page on phone and laptop.
- Owner step: the three preview screenshots in `docs/design/` (needed before the Phase 3 screens).

## Waiting on the owner

- Nothing yet; owner step 1.1 follows once CI is green.

## Known issues

- This Windows PC has Smart App Control on, which blocks the native bundler add-on Vitest uses, so `npm test` fails locally. Unit tests run in GitHub Actions instead. No Windows security setting was changed.
- `npm audit` reports 9 high findings in `braces`, used only by dev tools (shadcn CLI, eslint-config-next). Nothing ships to the browser or server. Recheck when those tools update; do not use `npm audit fix --force` (it downgrades them).

## Security follow-ups

Development-only exposures the owner chose to accept for now. All of these block the Phase 8 security sign-off. Production gets its own project, password and keys (owner step 8.1).

- 2026-10-23: The development database password was pasted into chat. Reset it before real content goes in.
- 2026-10-23: The first secret key (sb_secret_cS1c…) was pasted into chat. Delete it in Supabase, "API Keys", if it is still listed.
- 2026-10-23: The current secret key (sb_secret_1us9…) was also pasted into chat. Owner decided to use it for development. Replace it before real content or users go in.

## Open questions (asked when they come up)

| Question                                      | Recommended default                      | Answer |
| --------------------------------------------- | ---------------------------------------- | ------ |
| Freelancers see all-staff content by default? | No, only spaces they are added to        | –      |
| Spaces at launch and their managers           | HR, IT, Sales, Operations                | –      |
| Interface languages                           | English only, strings in one file        | –      |
| Company name, logo, accent colour             | Placeholder name, preview blue `#1a66c2` | –      |
| Custom domain                                 | Free Vercel address first                | –      |
| Existing content to import                    | No, decide after pilot                   | –      |
| Daily AI limit per person                     | 30                                       | –      |
