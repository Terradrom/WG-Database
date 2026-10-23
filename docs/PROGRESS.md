# Progress

Current phase: **Phase 0 – Accounts and tools**

## Done

- 2026-10-23: Computer checked: Node v24.15.0, npm 11.12.1, git 2.54.0 (all OK).
- 2026-10-23: Project folder created with the layout from the briefing (`app/`, `components/ui/`, `lib/`, `supabase/migrations/`, `supabase/tests/`, `tests/`, `docs/design/`).
- 2026-10-23: `docs/BRIEFING.md`, `CLAUDE.md`, `.env.example`, empty git-ignored `.env.local`, `.gitignore`, `README.md` created.
- 2026-10-23: Owner step 0.1 done: private repository https://github.com/Terradrom/WG-Database, first commit pushed to `main`.
- 2026-10-23: Owner step 0.2 done: Supabase project "Werbegeschenk Database" created.
- 2026-10-23: Owner step 0.3 done: Project URL (https://xdkpifmpfnntrhqvdouu.supabase.co), publishable key and secret key in `.env.local`. `node scripts/check-env.mjs` passes, including a live check that the project accepts both keys. The secret key works on the Auth admin API (0 users so far).

- 2026-10-23: Owner step 0.4 done: public sign-up switched off, Site URL `http://localhost:3000`, Redirect URL `http://localhost:3000/**`. Verified: a sign-up attempt through the API is refused (HTTP 422 `signup_disabled`), Email provider still on, 0 users in the project.
- 2026-10-23: **Checkpoint 0 reached.**

## Next

- Phase 1: Foundation and first deployment (Next.js app, tooling, `npm run check:env` with zod, Supabase clients, `/api/health`, CI, placeholder login page), then owner steps 1.1 (Vercel) and 1.2 (live address in Supabase).
- Before Phase 1, the owner saves the three preview screenshots in `docs/design/` (asked for with the request template).

## Waiting on the owner

- "Go" for Phase 1.

## Security follow-ups

Development-only exposures the owner chose to accept for now. All of these block the Phase 8 security sign-off. Production gets its own project, password and keys (owner step 8.1).

- 2026-10-23: The development database password was pasted into chat. Reset it before real content goes in.
- 2026-10-23: The first secret key (sb_secret_cS1c…) was pasted into chat. Delete it in Supabase, "API Keys", if it is still listed.
- 2026-10-23: The current secret key (sb_secret_1us9…) was also pasted into chat. Owner decided to use it for development. Replace it before real content or users go in.

## Open questions (asked when they come up)

| Question | Recommended default | Answer |
| --- | --- | --- |
| Freelancers see all-staff content by default? | No, only spaces they are added to | – |
| Spaces at launch and their managers | HR, IT, Sales, Operations | – |
| Interface languages | English only, strings in one file | – |
| Company name, logo, accent colour | Placeholder name, preview blue `#1a66c2` | – |
| Custom domain | Free Vercel address first | – |
| Existing content to import | No, decide after pilot | – |
| Daily AI limit per person | 30 | – |
