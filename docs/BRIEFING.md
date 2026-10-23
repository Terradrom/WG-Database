# Claude Code briefing: Team Knowledge Base

Oct 22, 2026 · @Werbegeschenk.de

## How to work with me (read first)

Whenever you need something only the owner can give or do, stop and ask with the template below, one request at a time, then wait for the answer. Never guess, invent credentials or work around a missing step.

**About the owner.** The owner has built internal tools but is not a full-time developer. Assume comfort with copy and paste, dashboards and a terminal, but not with Supabase, Vercel, email or DNS jargon. Name every click by its menu label. Dashboards change their wording over time, so if the owner's screen does not match your steps, ask for a screenshot instead of guessing.

**Rules**

1. One request at a time. Never hand over a list of ten chores; send the next one.
2. Every request uses the template below: why, time needed, numbered steps with exact menu paths, what to send back, what never to paste, and how you will check it.
3. Secrets stay out of chat. API keys, passwords and the Supabase secret key go into `.env.local` and the Vercel settings by the owner's own hands. You maintain `.env.example` with placeholder names and say which value goes where. If a secret is pasted into chat anyway, tell the owner to rotate it.
4. Check before moving on. After each owner step, verify it (run `npm run check:env`, call a test endpoint, read the deploy log) and say plainly whether it worked.
5. Offer a recommended default for every decision. Ask only about choices that really belong to the owner: money, domain names, who gets which role.
6. Stop at every checkpoint in the build plan. Show what now works, how to try it, and wait for the owner to say go before starting the next phase.
7. After each phase, update `docs/PROGRESS.md` with what is done, what is next and what is waiting on the owner.
8. Never run a destructive action (dropping tables, force-pushing, deleting buckets or users) without asking first.

**Request template.** Copy this shape every time you need the owner:

```text
NEED FROM YOU: <short title>
Why: <what this unlocks>
Time: <about N minutes>
Steps:
  1. Go to <site>.
  2. Click <exact menu path>.
  3. <next click or field to fill>.
Send back: <exactly what to paste or confirm>
Do NOT paste: <secrets that stay out of chat>
I'll check: <how you will verify it worked>
```

Phase 0 in the build plan contains fully worked examples of this template. Use them as the model for every later request.

## What we are building

An internal knowledge base with a Notion-like look, where coworkers and freelancers find instructions, guidelines and rules, and see only what their role allows.

**Who uses it**

- Employees and freelancers, in one company workspace. Freelancers do not have company email addresses, so accounts are plain Supabase users created by invitation, with no email-domain restriction.
- A few admins who manage spaces, people and roles.
- Editors who write and maintain pages, and viewers who read and search.

**Goals**

- Anyone can find an answer in under 30 seconds, on a phone or a laptop.
- Editors can write a page with text, images, video and AI-made diagrams without training.
- Access is enforced in the database, so a hidden page is hidden everywhere: sidebar, search, direct links and file URLs.
- The code stays portable: standard Postgres, no Vercel-only features, so it can move to the company's own server later.

**Not in version 1**

- Live co-editing. Editing is one person at a time, last save wins, with a warning when someone else saved first and a version history to recover from.
- Public pages, comments, offline editing, billing, multiple companies.

**Decisions already made**

| Topic | Decision |
| --- | --- |
| Sign-in | Accounts live in Supabase Auth. Email and password, plus magic link. Invite-only: public sign-up is switched off. No email-domain restriction. |
| Editing | One editor at a time. Autosave, a conflict warning, and version history. |
| Video | Short clips upload to Supabase Storage. Longer videos use embeds (YouTube unlisted, Loom, Vimeo). |
| AI | Claude API through a server route. It returns structured output (Mermaid or a chart spec), never HTML. |
| Look | Notion-style, as in the approved preview described in the design section. |

**Open questions to ask the owner when they come up** (use the request template; the recommended default is in brackets)

- Should freelancers see all-staff content by default? \[No. They see only spaces they are added to.\]
- Which spaces exist at launch, and who manages each? \[HR, IT, Sales, Operations as placeholders.\]
- Which languages does the interface need? \[English only, with all strings in one place so a translation can be added.\]
- What are the company name, logo and preferred accent colour? \[Placeholder name and the preview's blue.\]
- Is a custom domain wanted, such as wiki.company.com? \[Start on the free Vercel address.\]
- Is there existing content to import? \[No. Decide after the pilot.\]
- What is the daily AI limit per person? \[30 visualizations a day.\]

## Stack and architecture

A Next.js app on Vercel talks to Supabase for data, login and files, and to the Claude API for visualizations; every part can later move to the company's own server.

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js (App Router), TypeScript strict, Tailwind CSS, shadcn/ui | Fast to build, Notion-like components, runs on Vercel and in Docker |
| Editor | BlockNote | Block editor with slash menu, drag handles, image and video blocks; stores JSON |
| Database | Supabase Postgres | Standard Postgres with row-level security, full-text search, pgvector later |
| Auth | Supabase Auth, invite-only | Freelancers need no company email |
| Files | Supabase Storage, private buckets, signed URLs | Images and short video clips |
| Long video | Embeds from an allowlist (YouTube, Loom, Vimeo) | Avoids size and bandwidth limits |
| AI | Claude API from a server route; model name in `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) | The key never reaches the browser |
| Diagrams | Mermaid (strict mode) and Recharts from a validated JSON spec | Safe, structured output only |
| Tests | Vitest, Playwright, SQL tests for row-level security | Permissions are the riskiest part |
| Hosting | Vercel now; Docker on own server later | See portability rules |

**Portability rules**

- All schema changes are SQL migrations in `supabase/migrations`, applied with the Supabase CLI. Nothing is changed by hand in the dashboard without a matching migration.
- All configuration comes from environment variables, validated at startup with zod.
- No Vercel-only services (no Vercel KV, Blob or Edge-only APIs). Use `output: 'standalone'` in the Next.js config so a Docker image is possible.
- Content is stored as JSON and can be exported to Markdown, so nothing is locked into the editor.
- Supabase is open source and self-hostable. Keep Postgres extensions to `pg_trgm` and `pgvector`.

&#91;embedded content: architecture · browser, server routes, Supabase, Claude API\]

Plain reads and writes go from the browser straight to Supabase as the signed-in user. Anything that needs the secret key or the Claude API goes through a server route that checks the session first.

## Data model

Ten tables in the `public` schema, all with row-level security switched on and policies written in the same migration that creates them.

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users.id`), `email`, `display_name`, `avatar_url`, `user_type` (`employee` or `freelancer`), `global_role` (`admin` or `member`), `status` (`active` or `disabled`), `created_at` | Created by a trigger when an invited user first signs in |
| `invitations` | `id`, `email`, `user_type`, `global_role`, `grants` (JSON list of `{space_id, role, expires_at}`), `invited_by`, `created_at`, `accepted_at` | The trigger applies matching grants on first sign-in |
| `spaces` | `id`, `name`, `slug`, `description`, `icon`, `color`, `default_access` (`none`, `employees_view` or `everyone_view`), `created_by`, `created_at` | A space is the permission boundary (HR, IT, Sales...) |
| `space_members` | `space_id`, `user_id`, `role` (`viewer`, `editor` or `manager`), `expires_at` (nullable), unique on (`space_id`, `user_id`) | `expires_at` ends a freelancer's access automatically |
| `pages` | `id`, `space_id`, `parent_id`, `title`, `icon`, `cover_url`, `content` (JSON), `content_text`, `search` (generated tsvector), `position`, `is_archived`, `version`, `created_by`, `updated_by`, `created_at`, `updated_at` | `version` increases on every save and drives the conflict warning |
| `page_versions` | `id`, `page_id`, `version`, `title`, `content`, `saved_by`, `saved_at` | Keep the latest 50 per page |
| `media` | `id`, `space_id`, `page_id`, `kind` (`image`, `video` or `file`), `storage_path`, `original_name`, `caption`, `mime_type`, `size_bytes`, `duration_seconds`, `uploaded_by`, `created_at` | Embeds from YouTube, Loom or Vimeo live in the page JSON, not here |
| `favorites` | `user_id`, `page_id`, `created_at` | Powers the sidebar favorites |
| `ai_requests` | `id`, `user_id`, `page_id`, `kind`, `input_tokens`, `output_tokens`, `created_at` | Daily limits and cost tracking |
| `audit_log` | `id`, `actor_id`, `action`, `target_type`, `target_id`, `details` (JSON), `created_at` | Role changes, invitations, disabling users, permanent deletes. Admins read only |

**Storage.** One private bucket named `media`. Object path: `{space_id}/{page_id}/{uuid}-{filename}`. A storage policy reads the first path segment and applies the same space rules as the tables. Never use public URLs; the server issues signed URLs that expire after one hour.

**Limits.** Images up to 10 MB, resized in the browser to 2000 px on the long side before upload. Video clips up to 50 MB (`MAX_VIDEO_MB` in the environment, to be raised if the Supabase plan allows). Anything longer uses an embed.

**Search.** `pages.search` is a tsvector built from the title (weight A) and `content_text` (weight B), with a GIN index. A `pg_trgm` index on `title` and `media.caption` gives typo tolerance. A function `search_content(query text)` runs as security invoker, so row-level security filters results, and returns title, space, snippet (`ts_headline`), kind and rank.

**Helper functions.** `is_admin()` and `space_role(space_id)` are `security definer`, `stable`, with `set search_path = ''`. Every policy uses them. `space_role` returns the highest of: the user's membership role (ignoring expired rows), `viewer` when `default_access` allows their `user_type`, otherwise null.

## Roles and permissions

Three roles per space (viewer, editor, manager) plus one global admin role, enforced by Postgres row-level security so the interface can never grant more than the database allows.

| Capability | Viewer | Editor | Manager | Admin |
| --- | --- | --- | --- | --- |
| Read pages, images and videos in the space | Yes | Yes | Yes | Yes, all spaces |
| Search (results limited to what they can read) | Yes | Yes | Yes | Yes |
| View an AI visualization without saving it | Yes | Yes | Yes | Yes |
| Create, edit and move pages | No | Yes | Yes | Yes |
| Upload images and videos, add embeds | No | Yes | Yes | Yes |
| Insert an AI visualization into a page | No | Yes | Yes | Yes |
| Restore an earlier page version | No | Yes | Yes | Yes |
| Archive a page | No | Own pages | Yes | Yes |
| Manage space members, roles and expiry dates | No | No | Yes | Yes |
| Rename or change a space's default access | No | No | Yes | Yes |
| Create or delete spaces, delete pages for good | No | No | No | Yes |
| Invite users, change global roles, disable users | No | No | No | Yes |

**How access is decided**

1. A disabled user has no access to anything.
2. A global admin has the Admin column everywhere.
3. Otherwise the user's role in a space is their `space_members` role (ignoring rows past `expires_at`).
4. If they have no membership, the space's `default_access` can grant viewer: `employees_view` to employees only, `everyone_view` to employees and freelancers, `none` to nobody.
5. Pages inherit the space's access. There are no per-page permissions in version 1.

**Rules for the code**

- Row-level security is enabled on every table in `public` and on the `media` bucket. A table without a policy is a bug.
- Hidden means hidden: a user without access gets 404, not 403, for pages, spaces and file URLs, and sees nothing in the sidebar or search.
- The Supabase secret (service role) key exists only in server code for admin actions such as inviting users. It is never imported into client code.
- Public sign-up is off. Users arrive only through an invitation (the admin screen calls the Supabase admin API from a server route) or a user the owner creates by hand in the dashboard during setup.
- Every admin action writes a row to `audit_log`.

**Tests that must pass before Phase 2 is signed off**

- SQL tests (pgTAP or plain SQL scripts run in CI) covering every table and operation for five seeded users: admin, manager, editor, viewer and freelancer, plus an expired freelancer and a disabled user.
- A Playwright test where the freelancer opens a direct link to a page in a space they do not belong to and gets a 404, and the same page does not appear in search.
- A test that a signed file URL cannot be generated for media in an inaccessible space.

## Features and what done means

Each feature is finished only when its "done when" line can be shown to the owner at a checkpoint.

### 1. Permissions with roles

- Build: the roles above, a members and roles admin screen (invite by email, choose employee or freelancer, set a role per space, set an optional end date), and a disable-user switch.
- Done when: the SQL and Playwright tests pass, and the owner can invite a test freelancer, give them one space for two weeks, and watch every other space disappear for them.

### 2. Video and images

- Build: drag and drop, paste and the `/image` and `/video` slash commands; browser-side image resizing; upload progress for video; a poster frame; caption and alt text; embeds from the allowlist (`youtube-nocookie.com`, `loom.com`, `player.vimeo.com`) when a link is pasted. Signed URLs come from the server and refresh before they expire. Media loads lazily.
- Done when: an editor adds an image and a 30-second video from a phone in under a minute, a viewer in another space cannot open either file by URL, and a pasted YouTube link becomes a player.

### 3. AI visualization

- Build: a Visualize button in the top bar (whole page or selected blocks), a `/visualize` slash command, and a box under the result to refine it ("make this a timeline instead").
- Flow: the browser sends page id, block ids, an optional type and an optional instruction. The server route checks the user's access with their own session, extracts the text, and calls Claude with a strict output schema. It returns `{type, title, mermaid}` for diagrams or `{type, title, chart}` for charts, validated with zod. Mermaid is parse-checked on the server, with one automatic retry on a syntax error.
- Types in version 1: flowchart, sequence, timeline, org chart, mind map, and bar, line or pie chart from a table in the page.
- Rendering: Mermaid in strict security mode and Recharts from the JSON spec. Model output is never inserted as HTML.
- Saving: editors can keep the result as a `visualization` block that stores the spec, the prompt and a hash of the source text. The block shows an AI label, an "out of date" tag when the source changed, and Regenerate, Change type, Keep and Delete actions. Viewers can generate a result to look at but cannot save it.
- Guardrails: page text is data, not instructions to the model; a size cap on input; a per-user daily limit (default 30) counted in `ai_requests`; token usage logged; the API key only on the server.
- Done when: a page of numbered steps becomes the flowchart shown in the preview in under 10 seconds, and a page with a table becomes a chart.

### 4. Internal search

- Build: a Ctrl or Cmd+K palette (the Search screen in the preview), 150 ms debounce, result groups for pages and media, filter chips (All, Pages, Videos, Images, Files) and a space filter, highlighted matches, keyboard navigation, recent pages when the box is empty, and a footer line saying results are limited to what the user can access.
- Done when: results appear in under 200 ms with 5,000 pages, a misspelling such as "vnp" still finds the VPN guide, and a user without access gets zero results for a page they cannot read.

### 5. Mobile friendly

- Build: the sidebar becomes a drawer below 768 px, a bottom bar (Home, Search, Spaces, Ask AI), touch targets of at least 44 px, an editor toolbar that sits above the keyboard, and a web app manifest, icons and a service worker so it installs to the home screen.
- Done when: every screen works at 390 by 844 px, Lighthouse mobile scores 90 or more for performance and accessibility, and a page can be written on a phone.

### 6. Easy access

- Build: invite email, set password, land on Home; magic-link sign-in; a 30-day session; deep links that survive the login redirect; readable URLs such as `/p/vpn-setup-guide-x7k2`; Recent and Favorites in the sidebar; a Home page of recently updated pages in the user's spaces.
- Done when: a new freelancer goes from invitation email to reading their first page in under two minutes without help.

### 7. Efficient and future-proof

- Build: the sidebar tree loads children only when expanded; autosave 1.5 seconds after the last keystroke with a Saved indicator; the conflict warning using `version`; version history; Markdown export of any page; the editor and Mermaid loaded lazily; indexes on every foreign key and on the search columns.
- Operations: daily database backups (Supabase paid plans) plus a weekly `pg_dump` script, `docs/RUNBOOK.md` for restore and key rotation, and `docs/SELF_HOSTING.md` outlining the move to Docker and self-hosted Supabase.
- Budgets: largest contentful paint under 2.5 seconds on a mid-range phone over 4G; the page route's JavaScript under 250 KB gzipped, not counting the lazy-loaded editor and Mermaid.
- Done when: the portability rules pass a review, a restore from backup has been practiced once, and the budgets are met on the production URL.

## Design spec

The look is a calm, Notion-style workspace: a left sidebar, a wide white reading column, quiet greys and one accent colour. The three screens below were approved in the [Knowledge Base Preview](https://claude.ai/artifact/X1DRCn8xCqmSdtVrnwN9eD) and are the visual reference.

**Owner step before Phase 1:** open the preview, take a screenshot of each of the three screens, and save them in the project as `docs/design/page-desktop.png`, `docs/design/search.png` and `docs/design/mobile.png`. Claude Code cannot open the preview link, so it needs these files. Ask the owner for them with the request template.

**Screens**

- Page view (desktop): sidebar 260 px wide; top bar 48 px with breadcrumb, edited time, role chip ("Your role: Editor"), Share and Visualize buttons; a 140 px cover; a 72 px page icon overlapping the cover; title; property rows (Owner, Visible to, Tags, Last reviewed); then blocks. Reading column is at most 780 px wide.
- Search (Ctrl+K): a centred dialog 680 px wide, 96 px from the top, over a dimmed page; query field, filter chips, grouped results with highlighted matches, an "Ask AI about" row, and a footer saying results show only what the role can access.
- Mobile: 390 by 844 px, top bar with menu, breadcrumb, Visualize and more; page content in one column; a four-tab bottom bar (Home, Search, Spaces, Ask AI).

**Tokens**

| Token | Value |
| --- | --- |
| Font | Inter, weights 400, 500, 600, 700; system sans-serif fallback |
| Text | `#37352f`; secondary text `#65645f`; faint lines and icons `#9b9a97` |
| Backgrounds | page `#ffffff`; sidebar `#f7f7f5`; selected row and borders `#ebeae6`; callout `#f1f1ef` |
| Accent | `#1a66c2` by default; a single CSS variable so it can be changed in one place |
| Role chip | background `#e7f3f8`, text `#1b5e7a` |
| Success | background `#e8f4ec`, border `#b9d9c2`, text `#1c5a3a` |
| Search highlight | `#fbe9a6` behind dark text |
| Space tiles | HR `#fbe4e4` on `#8c2f2f`; IT `#dbeddb` on `#1c5a3a`; Sales `#fdecc8` on `#7a4a07`; Operations `#e3e2e0` on `#504f4b` |
| Video block | background `#2b2a27`, white play button and progress line |
| Type scale | page title 40/1.15 bold (30 on mobile); section heading 26 semibold; body 16/1.5; secondary 14; caption 13; small label 12 |
| Radius | 6 px buttons, rows, callouts; 8 px blocks and cards; 12 px dialogs |
| Spacing | steps of 4, 8, 12, 16, 24; 8 px between sidebar rows |

**Components to build once and reuse**

Sidebar tree item (with expand arrow, tile or page icon, active state), breadcrumb, role chip, property row, callout, checklist item, image block with caption, video block with poster and progress bar, embed block, AI visualization block (header with Regenerate and Change type, body, refine input), command palette dialog, search result row, filter chip, bottom tab bar, members table.

**Rules**

- Use one stroke icon set (lucide) at 1.8 px stroke. No emoji in the interface.
- Every control is a real `button` or `a`, reachable by keyboard, with a visible 2 px focus ring in the accent colour. Icon-only buttons have an `aria-label`.
- Text contrast meets WCAG AA (4.5 to 1). Never convey meaning by colour alone.
- Respect `prefers-reduced-motion`. Dark mode is not in version 1, but use CSS variables for every colour so it can be added later.
- On screens narrower than 768 px the sidebar becomes a drawer and the properties wrap under their labels.

## Build plan

Nine phases, each ending in a checkpoint the owner can try. Every moment where the owner must act is marked **Owner step**, and each one is delivered with the request template from the first section. Phase 0 shows the template fully worked out.

### Phase 0: Accounts and tools (about 30 minutes, all owner steps)

Claude Code first checks the computer itself with `node -v` (20 or newer), `npm -v` and `git --version`, and asks the owner to install anything missing from nodejs.org or git-scm.com.

**Owner step 0.1: GitHub repository**

```text
NEED FROM YOU: A private GitHub repository
Why: The code, its history and automatic deployments all live here.
Time: about 3 minutes
Steps:
  1. Go to github.com and sign in (create a free account first if you have none).
  2. Click the + icon at the top right, then “New repository”.
  3. Name it team-knowledge-base and choose “Private”. Leave every checkbox empty.
  4. Click “Create repository”.
Send back: the repository address, for example https://github.com/yourname/team-knowledge-base
Do NOT paste: any password or access token
I'll check: that I can push a first commit (you may be asked to sign in to GitHub once in the terminal)
```

**Owner step 0.2: Supabase project**

```text
NEED FROM YOU: A Supabase project
Why: This is where users, pages, permissions and files will live.
Time: about 5 minutes
Steps:
  1. Go to supabase.com and sign in (signing in with GitHub is fine).
  2. Click “New project” and pick your organization.
  3. Name it team-knowledge-base and choose the region closest to most of your coworkers.
  4. Create a strong database password and save it in your password manager.
  5. Click “Create new project” and wait until the dashboard finishes loading.
Send back: the word “created”
Do NOT paste: the database password
I'll check: in the next step, when the project address answers
```

**Owner step 0.3: Connect the keys**

```text
NEED FROM YOU: The project address and keys
Why: The app needs them to reach your Supabase project.
Time: about 5 minutes
Steps:
  1. In Supabase open your project, click the gear icon “Project Settings” (bottom left), then “API Keys”. Older projects call this page “API”.
  2. Copy the “Project URL”. It looks like https://abcdefgh.supabase.co
  3. Copy the “publishable” key (older name: “anon public”). It is public by design, so you can paste it here.
  4. Find the “secret” key (older name: “service_role”). Do not paste it here. Open the file .env.local in the project folder with any text editor (I created it for you), put the key after SUPABASE_SERVICE_ROLE_KEY= and save the file.
Send back: the Project URL, the publishable key, and the word “saved” once the secret key is in .env.local
Do NOT paste: the secret or service_role key
I'll check: npm run check:env confirms all three values are present without printing them
```

**Owner step 0.4: Close public sign-up**

```text
NEED FROM YOU: Switch off public sign-up
Why: Only people you invite should be able to get an account.
Time: about 2 minutes
Steps:
  1. In Supabase click “Authentication”, then “Sign In / Providers” (older: “Providers” or “Settings”).
  2. Under “User Signups” switch off “Allow new users to sign up”. Keep the Email provider on.
  3. Click “URL Configuration”. Set “Site URL” to http://localhost:3000 and add http://localhost:3000/** under “Redirect URLs”. Save.
Send back: a screenshot of the sign-up setting showing it is off
Do NOT paste: nothing sensitive is needed
I'll check: I try to sign up a new address through the API and expect it to be refused
```

**Checkpoint 0:** the repository exists, the Supabase address and keys work, sign-up is closed. Claude Code commits `.env.example`, a README, `docs/BRIEFING.md` and `docs/PROGRESS.md`.

**Environment variables.** Claude Code lists them in `.env.example` and the owner fills `.env.local` (and later the Vercel settings).

| Name | Comes from | Secret |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project Settings, API Keys | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Console (Phase 6) | Yes |
| `ANTHROPIC_MODEL` | Default `claude-sonnet-5-5` | No |
| `APP_URL` | The deployed address, `http://localhost:3000` while developing | No |
| `MAX_VIDEO_MB` | Default 50 | No |
| `AI_DAILY_LIMIT` | Default 30 | No |

### Phase 1: Foundation and first deployment

- Claude Code builds: the Next.js app (TypeScript strict, Tailwind, shadcn/ui, lucide icons), ESLint and Prettier, Vitest and Playwright, zod environment validation with `npm run check:env`, Supabase client helpers for server and browser, a `/api/health` route, a GitHub Actions workflow running typecheck, lint and tests, and a placeholder login page.
- Checkpoint 1: the owner opens the live Vercel address on a phone and a laptop and sees the login page.

**Owner step 1.1: Connect Vercel**

```text
NEED FROM YOU: Connect the repository to Vercel
Why: Vercel hosts the app and redeploys it on every change.
Time: about 8 minutes
Steps:
  1. Go to vercel.com and choose “Continue with GitHub”.
  2. Click “Add New…”, then “Project”.
  3. Find team-knowledge-base in the list and click “Import”.
  4. Leave the framework as Next.js. Open “Environment Variables” and add the names from .env.example that I list for you, typing each value yourself. Add the secret key only here and in .env.local, never in chat.
  5. Click “Deploy” and wait for the confetti or the “Congratulations” page.
Send back: the address Vercel shows, ending in .vercel.app
Do NOT paste: the Supabase secret key
I'll check: the address loads the login page and /api/health answers ok
```

**Owner step 1.2: Tell Supabase the live address**

```text
NEED FROM YOU: Add the live address to Supabase
Why: Invitation and magic-link emails must send people back to the live site.
Time: about 2 minutes
Steps:
  1. In Supabase click “Authentication”, then “URL Configuration”.
  2. Set “Site URL” to your .vercel.app address.
  3. Under “Redirect URLs” add your address followed by /** and keep the localhost one. Save.
Send back: the word “saved”
Do NOT paste: nothing sensitive is needed
I'll check: I request a magic link for your test user and confirm the link points to the live address
```

### Phase 2: Database, roles and login

- Claude Code builds: migrations for all tables, the helper functions, row-level security policies, the trigger that creates a profile and applies an invitation on first sign-in, the empty `media` bucket with its policies, a seed script (`npm run seed`, which refuses to run against production) creating demo spaces and test users for every role, the login, magic-link, forgot-password and set-password screens, session handling, 404 behavior, and all tests listed under Roles and permissions.
- Checkpoint 2: the owner signs in as admin, then as the seeded freelancer, and sees only the space the freelancer belongs to. Claude Code shows the passing test results.

**Owner step 2.1: Create the first admin**

```text
NEED FROM YOU: Create your own admin account
Why: Sign-up is closed, so the first account has to be made by hand.
Time: about 4 minutes
Steps:
  1. In Supabase click “Authentication”, then “Users”.
  2. Click “Add user”, then “Create new user”.
  3. Enter your own email and a strong password (save it in your password manager). Tick “Auto Confirm User”.
  4. Click “Create user”.
  5. I will then give you one line of SQL with your email filled in. Open “SQL Editor”, click “New query”, paste it, and click “Run”.
Send back: the email you used, then the word “run” after step 5
Do NOT paste: your password
I'll check: you can sign in to the app and the Members screen is visible to you
```

### Phase 3: App shell, pages and editor

- Claude Code builds: the sidebar tree (children load on expand), spaces list, creating, renaming, moving (drag and drop) and archiving pages, breadcrumb, property rows, the BlockNote editor with slash menu, autosave, the version-conflict warning, version history with restore, favorites, and the Home page.
- Checkpoint 3: the owner writes a real page, reloads it, edits the same page in a second browser to see the conflict warning, and restores an earlier version.
- Owner step 3.1: Claude Code asks, with the request template, for the space names wanted at launch and, for each, the person who should manage it (name and email). Recommended default: HR and People, IT and Security, Sales, Operations.

### Phase 4: Images and video

- Claude Code builds: upload components with browser-side image resizing, video upload with progress and a poster frame, the signed-URL route, the embed allowlist, `media` rows, and storage policy tests.
- Checkpoint 4: the owner uploads an image and a 30-second video from a phone, and a viewer in another space cannot open either file by its URL.
- Owner step 4.1 (only if clips longer than 50 MB are wanted): Claude Code tells the owner what the current Supabase plan allows and, if needed, walks through Supabase, “Project Settings”, “Storage”, “Upload file size limit”. Larger or longer videos should use embeds instead.

### Phase 5: Search

- Claude Code builds: the search column and indexes, the `search_content` function, the API route, the Ctrl or Cmd+K palette with filters, recent pages and keyboard navigation, and tests for permissions and typos.
- Checkpoint 5: the owner searches for a real term and for a misspelling of it, and the seeded freelancer sees only results from their own space.

### Phase 6: AI visualization

- Claude Code builds: the `visualization` block, the `/visualize` command and top-bar button, the server route with schema validation and one retry, Mermaid and Recharts rendering, the refine box, daily limits, `ai_requests` logging, and tests using mocked model output that includes malicious Mermaid and HTML.
- Checkpoint 6: the owner turns a real page into a flowchart, changes it to a timeline, saves it, edits the page, and sees the "out of date" tag.

**Owner step 6.1: Anthropic API key**

```text
NEED FROM YOU: An Anthropic API key
Why: This lets the app ask Claude to turn pages into diagrams and charts.
Time: about 10 minutes
Steps:
  1. Go to console.anthropic.com and sign in, or create an account.
  2. Open “Billing” and add a payment method or credits.
  3. Set a monthly spend limit that suits a pilot (for example 20 US dollars) under “Limits”.
  4. Open “API Keys”, click “Create Key”, and name it team-knowledge-base.
  5. Copy the key once. Put it in .env.local after ANTHROPIC_API_KEY= and save.
  6. In Vercel open your project, then “Settings”, “Environment Variables”, add ANTHROPIC_API_KEY with the same value for all environments, then click “Redeploy”.
Send back: the word “saved”
Do NOT paste: the API key
I'll check: npm run check:env passes and a test call returns a short reply
```

### Phase 7: Mobile, installation and admin screens

- Claude Code builds: the drawer sidebar, bottom tab bar, phone editor toolbar, web app manifest, icons and service worker, the Members and roles screen (invite, set role per space, set end dates, disable user; invitations go through a server route using the secret key), the audit log view, and a Lighthouse budget check.
- Checkpoint 7: the owner invites a real test freelancer from the admin screen, the freelancer receives the email and lands on Home, and the app is installed to a phone's home screen.

**Owner step 7.1: Email for invitations**

```text
NEED FROM YOU: A sender for invitation emails
Why: Supabase's built-in sender allows only a few emails an hour and is not meant for real use.
Time: about 20 minutes, plus waiting for DNS to update
Steps:
  1. Tell me who manages your company's domain (DNS). You will need them for step 3.
  2. Create a free account at resend.com (I recommend it; any SMTP service works).
  3. In Resend click “Domains”, add your company domain, and add the DNS records it shows at your domain provider. Wait until it says “Verified”.
  4. In Resend click “API Keys” and create one with permission to send emails.
  5. In Supabase click “Authentication”, then “Emails”, then “SMTP Settings” (older: “Project Settings”, “Authentication”). Turn on “Enable custom SMTP” and fill in the host, port, username, password and sender address that Resend lists. Type the password there yourself.
Send back: the sender address you chose, for example wiki@yourcompany.com
Do NOT paste: the Resend key or SMTP password
I'll check: I send an invitation to your own address and confirm it arrives
```

If no domain or DNS access is available, the fallbacks are an SMTP mailbox from the company's IT person (host, port, username, password) or continuing to create users by hand in the Supabase dashboard.

- Owner step 7.2: Claude Code asks for a square logo as a 512 by 512 px PNG for the app icon, and generates a placeholder if none exists.
- Installing on a phone: iPhone, open the site in Safari, tap Share, then “Add to Home Screen”. Android, open it in Chrome, tap the menu, then “Install app”.

### Phase 8: Hardening and pilot

- Claude Code builds and checks: a review against the security rules, rate limits on every API route, security headers and a content security policy, friendly error pages, the `pg_dump` script and a practiced restore, `docs/RUNBOOK.md`, accessibility checks with axe in Playwright, and an admin guide.
- Owner step 8.1: Production setup. Recommended: a second Supabase project for production, with its own Vercel production variables. Claude Code walks the owner through steps 0.2 to 0.4 again for the new project, then applies the migrations with the Supabase CLI.
- Owner step 8.2: Decide on a paid Supabase plan for daily backups and larger files. Claude Code states what the free plan lacks so the owner can decide.
- Owner step 8.3: Pilot. Invite three to five coworkers, including one freelancer, and collect feedback for a week.
- Checkpoint 8: a backup restore has been practiced, the security checklist is signed off, and the pilot users are active.

### Later, not in the first build

- Ask the knowledge base: embeddings with pgvector, answers that cite only pages the asker can read.
- Live co-editing (Yjs or a similar library).
- Single sign-on with Google or Microsoft for employees, next to invitations.
- Comments, page-level permissions, notifications, dark mode, content import from Notion or Markdown.
- The move to Docker and self-hosted Supabase.

## Security, quality and conventions

Permissions, secrets and untrusted content are the three places where this app can fail badly, so they get explicit rules.

**Security**

- Secrets only in environment variables. `.env.local` is in `.gitignore`; the secret key and the Anthropic key never appear in client bundles, logs, error messages or commits. Check with a secret scan in CI.
- Validate every API input with zod and check the session and the user's role on the server for every route, even though row-level security also protects the data.
- Treat page content, uploaded files and model output as untrusted. Sanitize any rich text with DOMPurify, never use `dangerouslySetInnerHTML` on raw content, run Mermaid in strict mode, and allow embeds only from the three listed hosts.
- Upload checks: allowed MIME types and size limits on the server, random file names, no SVG uploads as images.
- Send security headers and a content security policy. Rate-limit sign-in, invitations, uploads, search and AI routes.
- Do not log personal data or page content. Log ids and timings.

**Quality**

- TypeScript in strict mode, no `any` without a comment. ESLint and Prettier run in CI.
- Every phase ships with tests: unit tests for logic, SQL tests for permissions, Playwright for the main journeys (sign in, write a page, upload, search, visualize, invite).
- A change is not done until typecheck, lint and tests pass and the Vercel preview deploy works.
- Accessibility: keyboard reachable, labelled controls, AA contrast, checked with axe in CI.

**Conventions**

- Work in small branches and pull requests; each phase is a set of pull requests merged to `main`, which deploys to production. Use conventional commit messages (`feat:`, `fix:`, `docs:`).
- All user-facing strings live in one `messages` file so a translation can be added later.
- Folder layout:

```text
app/                 Next.js routes (pages, API routes)
components/          UI components (ui/ for shadcn)
lib/                 supabase clients, permissions helpers, ai, search, env
supabase/migrations/ SQL migrations, one per change
supabase/tests/      SQL permission tests
tests/               Vitest and Playwright
docs/                BRIEFING.md, PROGRESS.md, RUNBOOK.md, SELF_HOSTING.md, design/
```

- Keep `docs/PROGRESS.md` current: phase, what is done, what is next, what is waiting on the owner.
- Write the README so someone new can run the project in 15 minutes: prerequisites, environment variables, `npm run dev`, `npm run seed`, `npm test`, and how deployment works.

## Definition of done and how to start

The project is done when every box below is ticked and the owner has confirmed it at a checkpoint.

- [ ] All seven features meet their "done when" lines.
- [ ] Permission tests pass for every role, and the freelancer cannot reach anything outside their spaces by sidebar, direct link, search or file URL.
- [ ] Public sign-up is off, and this was verified by an attempted sign-up.
- [ ] The secret scan passes and no secret appears in the repository or the browser bundle.
- [ ] Every screen works at 390 by 844 px, and Lighthouse mobile scores 90 or more for performance and accessibility.
- [ ] Backups are configured and a restore has been practiced.
- [ ] `README.md`, `docs/RUNBOOK.md`, `docs/SELF_HOSTING.md` and `docs/PROGRESS.md` are current.
- [ ] Production runs on its own Supabase project and the pilot users are active.

**How the owner starts**

1. Create an empty folder named `team-knowledge-base` on your computer and open a terminal inside it.
2. In this doc, use the Export menu to download it as Markdown, and save the file in that folder as `BRIEFING.md`.
3. Start Claude Code in that folder by running `claude`.
4. Paste the first prompt below.

Claude Code then creates `docs/BRIEFING.md` from that file and a short `CLAUDE.md` so every later session reads the briefing first. This is the content of `CLAUDE.md`:

```text
# Team Knowledge Base

Read docs/BRIEFING.md at the start of every session. It is the source of truth for the stack, data model, roles, design and build plan.

Follow its “How to work with me” rules: one request at a time, the request template, no secrets in chat, verify after each owner step, stop at every checkpoint, and keep docs/PROGRESS.md current.
```

**First prompt to paste into Claude Code**

```text
Read BRIEFING.md fully before doing anything, then move it to docs/BRIEFING.md and create CLAUDE.md as described in its last section.

We are building the Team Knowledge Base from that briefing. Start with Phase 0. Follow “How to work with me”: ask me for things one at a time with the request template, wait for my answer, and verify each step. Check my computer first (node, npm, git), then create the folder structure, .env.example, an empty git-ignored .env.local and docs/PROGRESS.md. Make the first commit once I have created the GitHub repository.

Do not start Phase 1 until I say go.
```
