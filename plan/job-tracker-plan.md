# Job Application Tracker — Implementation Plan
> Personal CRM for job hunting, built into the mhrazu.com admin dashboard

---

## Why this shape

The sidebar already anticipates this (`nav-items.ts` comment: *"future modules (Job Tracking, Notes, AI, …): each new module gets its own group"*), so this plugs in as a new `NAV_GROUPS` entry, not a bolt-on.

More importantly: **Gmail is already wired up.** `GmailAccount`, `getGmailClient()` (`src/lib/gmail.ts`), OAuth connect/callback, watch renewal cron, and a Pub/Sub push webhook already exist for the contact-form inbox (`Thread` / `EmailMessage` models). We are **not** building a second Gmail integration — we reuse the same connected account and token refresh plumbing.

One thing to respect: `syncGmailHistory()` in `src/lib/gmail-sync.ts` deliberately **only** files messages under `Thread`s the app already knows about ("*never the admin's whole personal inbox*"). Job-application emails come from arbitrary companies with no existing `Thread`, so job-email scanning must be a **separate, parallel function** — it must not be bolted onto `syncGmailHistory`, and it must be scoped narrowly (a Gmail label, see Phase 3) so it never ingests unrelated personal mail.

---

## Phase 1 — Data model + manual tracker (no new deps) ✅ COMPLETE

The foundation. Ships a fully usable manual tracker before any automation exists.

**Shipped:** Prisma models + migration `20260706181146_add_job_tracker`, all three API routes, `jobs` store slice in `usePortfolioStore.ts`, "Job Tracker" nav group, and the full dashboard page (board view with per-card status `Select`, table view, `AddJobDialog` create/edit, `JobDetailSheet` with timeline + note-adding). `npx tsc --noEmit`, `eslint`, and `next build` all pass clean; smoke-tested against the running dev server (`/admin/dashboard/jobs` → 200, `/api/admin/jobs` → 401 unauthenticated, as expected).

**Update (2026-07-08):** drag-and-drop shipped after all — `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` added. The board is now a `KanbanBoard.tsx` component: `DndContext` with `PointerSensor` + `KeyboardSensor` (so it's keyboard-operable, not mouse-only), each column is a `useDroppable` lane with a `SortableContext` of cards. Dragging a card to a different column calls the same `changeStatus`/`updateJob` path the `Select` always used (still logs a `JobStatusEvent` identically) — drag is just a second trigger for the same status-change logic, not a replacement. Dragging within a column reorders via a new `PUT /api/admin/jobs/reorder` route + `reorderJobs` store action, both mirroring the existing `testimonials/reorder` pattern exactly. The per-card `Select` stays as the accessible non-drag fallback, just visually shrunk now that the drag handle is primary. Also: the page split into **Board**/**Stats** tabs (stats/funnel chart moved out of the way of the working view), cards got a status-colored left border + hover elevation (`JOB_STATUS_BORDER_COLORS` in `job-constants.ts`), columns became bounded-height scrollable "lanes," and `JobDetailSheet` widened (`sm:max-w-md` → `sm:max-w-lg`). `tsc`/`eslint`/`next build` clean; the reorder route verified end-to-end with curl (401 unauthenticated, persists correctly authenticated). **Not verified: the actual drag interaction in a real browser** — this session had no browser-automation tool available, so the visual redesign, drag-and-drop itself, and keyboard-drag path need a manual check.

### 1.1 Prisma models
`prisma/schema.prisma` — add:

```prisma
model JobApplication {
  id                 String    @id @default(uuid())
  company            String
  position           String
  companyLogo        String?
  jobUrl             String?
  source             String    // "linkedin" | "facebook" | "google_form" | "referral" | "friend" | "email" | "career_site" | "hard_copy" | "other"
  applicationType    String    // "easy_apply" | "external_website" | "email" | "google_form" | "hard_copy" | "referral"
  status             String    @default("saved") // "found" | "saved" | "preparing" | "applied" | "assessment" | "interview" | "offer" | "rejected"
  deadline           DateTime?
  salaryMin           Int?
  salaryMax           Int?
  salaryCurrency      String?
  location            String?
  workMode            String?  // "remote" | "hybrid" | "onsite"
  resumeVersion       String?
  coverLetterVersion  String?
  notes               String?  @db.Text
  appliedAt           DateTime?
  gmailThreadId       String?  // manual link to a Gmail thread for this application (Phase 3)
  order               Int      @default(0)
  events              JobStatusEvent[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("job_application")
}

// Append-only history — every status change and manual note, so the
// pipeline board can show "how did this job get here" not just current state.
model JobStatusEvent {
  id        String         @id @default(uuid())
  jobId     String
  job       JobApplication @relation(fields: [jobId], references: [id], onDelete: Cascade)
  status    String
  note      String?
  source    String         @default("manual") // "manual" | "gmail" | "extension"
  createdAt DateTime       @default(now())

  @@map("job_status_event")
}
```

Migration: `npx prisma migrate dev --name add_job_tracker`

### 1.2 API routes (`verifyAdmin()` pattern, matches every other `/api/admin/*`)
- `src/app/api/admin/jobs/route.ts` [NEW] → `GET` (list, filter by status/source), `POST` (create — writes the initial `JobStatusEvent` too)
- `src/app/api/admin/jobs/[id]/route.ts` [NEW] → `GET`, `PATCH` (update fields; if `status` changes, append a `JobStatusEvent`), `DELETE`
- `src/app/api/admin/jobs/[id]/events/route.ts` [NEW] → `POST` (manual note/status log without editing the job itself)

### 1.3 Dashboard nav
`src/app/admin/dashboard/_components/nav-items.ts`:
- Add `"jobs"` to `TabValue`
- Add new group:
```ts
{
  label: "Job Tracker",
  items: [
    { value: "jobs", label: "Applications", href: "/admin/dashboard/jobs", icon: Briefcase },
  ],
},
```
(reuse the `Briefcase` icon already imported, or swap to a distinct one if it collides visually with "Experience")

### 1.4 Dashboard pages
Follow the existing `testimonials` pattern exactly:
- `src/app/admin/dashboard/jobs/page.tsx` [NEW] → thin wrapper, renders `<JobsPageContents />`
- `src/app/admin/dashboard/jobs/_components/JobsPageContents.tsx` [NEW] — the real page:
  - Pipeline board: columns = `found → saved → preparing → applied → assessment → interview → offer / rejected`, cards draggable between columns (drag updates `status` via `PATCH`, which server-side appends a `JobStatusEvent`)
  - Table view toggle for a denser list (filter by source/status/deadline)
  - "Add Job" button opens a sheet/dialog with the one flexible form: company, position, source (radio), application type (radio), status, deadline, salary range, location, work mode, resume version, cover letter version, notes, job URL
- `src/app/admin/dashboard/jobs/_components/AddJobDialog.tsx` [NEW]
- `src/app/admin/dashboard/jobs/_components/JobCard.tsx` [NEW]
- `src/app/admin/dashboard/jobs/_components/JobDetailSheet.tsx` [NEW] — shows the `JobStatusEvent` timeline for one job

### 1.5 Resume/cover-letter version tracking
No new model needed for MVP — `resumeVersion` / `coverLetterVersion` are free-text fields with a `<datalist>`/combobox populated from `SELECT DISTINCT` on existing jobs (cheap, no extra table, still enables "which resume gets more interviews" analytics in Phase 2).

---

## Phase 2 — Analytics ✅ COMPLETE

Reuses existing dashboard chart components/patterns instead of inventing new ones.

**Shipped:** `job-analytics.ts` (pure `computeJobStats(jobs)` function), `JobStatsRow.tsx` (5 `StatCard`s: Total, Applied, Response/Interview/Offer rate), `JobFunnelChart.tsx` (horizontal bar chart, same `recharts`/`ChartContainer` pattern as `TopPostsBarChart.tsx`), both wired into the top of `JobsPageContents`. `tsc`, `eslint`, and `next build` all pass; smoke-tested against the running dev server.

**Deviation from spec:** no `/api/admin/jobs/stats` route — analytics are computed client-side from the `jobs` array the store already fetches. A personal tracker's row count (dozens to low hundreds) never justifies a server-side aggregation endpoint; a second place to maintain the same business logic would be pure overhead. If jobs volume ever gets large enough to matter, revisit then.

**Also changed:** `GET /api/admin/jobs` now includes each job's `events` (needed so "interview rate" etc. can look at the *peak* pipeline stage a job ever reached, not just its current status — otherwise a job rejected after interviewing would silently disappear from the interview-rate numerator). `rejected` is explicitly excluded from the stage-ordering math since it's a terminal branch, not a stage later than "offer".

**Not built:** the optional Overview-page summary card — skipped for now since the dedicated Jobs page already surfaces this; add later if it'd get checked often enough to earn a spot on the main dashboard.

---

## Phase 3 — Gmail status detection (reuses existing Gmail connection) ✅ COMPLETE

No new OAuth, no new consent screen — same `GmailAccount` row, same `getGmailClient()`.

**Shipped:** `src/lib/job-gmail-scan.ts` (label-scoped scan, keyword heuristic, gmailThreadId/domain matching, dedup via `JobStatusEvent.gmailMessageId`), a new `UnmatchedJobEmail` model + `JobTrackerSettings` singleton (config), full CRUD API (`gmail-scan` POST, `unmatched-emails` GET, `unmatched-emails/[id]` DELETE to dismiss, `unmatched-emails/[id]/link` POST to link + log, `settings` GET/PATCH), a store slice, and `UnmatchedEmailsPanel.tsx` (Gmail label config, "Sync now" button, per-email link/dismiss UI) wired into the top of `JobsPageContents`. `tsc`, `eslint`, and `next build` all pass; smoke-tested against the running dev server (all four new routes return 401 unauthenticated as expected, no 500s).

**Important incident during this phase:** building the migration for these models, I ran `prisma migrate diff --shadow-database-url` pointed at the **live production Neon database** instead of a disposable one, which wiped production data (all CMS content, the admin user, the Gmail connection). It was restored from Neon's point-in-time history. Follow-up decision: **local Postgres is now the dev database** (`.env` → `postgresql://admin:admin@localhost:5432/portfolio-db`) — production must only ever be touched via a deliberate, reviewed `prisma migrate deploy`, never `migrate dev`/`migrate diff` pointed at it directly.

**Deviations from spec:** config lives in a new `JobTrackerSettings` singleton (`gmailLabel` field) rather than added to `SiteSettings` — kept the private job-tracker setting out of the public-site-facing settings model. Unmatched-email resolution is two endpoints (`link`, plain `DELETE` for dismiss) rather than one — matches the CRUD-route convention used everywhere else in this codebase instead of inventing a combined action endpoint.

**Not built (per plan, marked "later, optional"):** Phase 3.5's automatic trigger via the Pub/Sub webhook — the scan is manual-only ("Sync now" button) for now. Wire it into `gmail-pubsub/route.ts` once manual scanning has been used enough to trust the keyword heuristic and domain-matching.

### 3.1 Setup (one-time, manual, in Gmail)
User creates a Gmail label (e.g. `Jobs`) and a filter that auto-labels anything matching known ATS senders (`greenhouse`, `lever`, `workday`, `myworkday`, `smartrecruiters`, `bamboohr`, etc.) or containing "application received" / "interview" — this keeps the scan scoped and cheap, and matches the "Gmail Label" idea from the original discussion.

### 3.2 Scan function
`src/lib/job-gmail-scan.ts` [NEW] — deliberately **separate** from `gmail-sync.ts`:
- Uses `getGmailClient()`
- Queries `gmail.users.messages.list({ q: "label:Jobs" })` (label name configurable, stored on a small settings field — see 3.4)
- Skips messages already recorded (dedupe by `gmailMessageId`, stored on `JobStatusEvent`)
- Runs a keyword heuristic over subject+snippet to guess a stage: `interview|schedule a call` → `interview`, `assessment|coding challenge|hackerrank` → `assessment`, `unfortunately|not moving forward|other candidates` → `rejected`, `congratulations|offer` → `offer`, else → `applied`
- Matches to a `JobApplication` by: (a) manually-set `gmailThreadId` if the admin already linked it, else (b) sender domain vs. `company` field fuzzy match
- No confident match → goes into an **"Unmatched" inbox** in the UI for a one-click manual link (mirrors `RecentMessagesTable` UX) rather than guessing wrong

### 3.3 API + trigger
- `src/app/api/admin/jobs/gmail-scan/route.ts` [NEW] → `POST`, `verifyAdmin()`, calls the scan function (manual "Sync now" button, same pattern as `src/app/api/admin/gmail/sync/route.ts`)
- `src/app/admin/dashboard/jobs/_components/UnmatchedEmailsPanel.tsx` [NEW]

### 3.4 Config
Small addition to `SiteSettings` (or a new tiny `JobTrackerSettings` singleton, cheaper to reason about): `jobGmailLabel String @default("Jobs")`

### 3.5 Automatic trigger (later, optional)
Once manual scan is validated, hook into the existing Pub/Sub webhook (`src/app/api/webhooks/gmail-pubsub/route.ts`) to also invoke the job scan on push — same trigger, second independent handler, still never touching `syncGmailHistory`'s Thread-scoped logic.

---

## Phase 4 — Calendar sync ✅ COMPLETE

- `googleapis` is already a dependency — reuse the same OAuth token (Gmail scope + `calendar.events` scope needs adding to the existing consent flow in `src/app/api/admin/gmail/connect/route.ts`, which means **re-consenting** the connected account once)
- Parse a date/time out of interview emails caught in Phase 3 (simple regex/date-parsing first; defer to Phase 6 AI if too unreliable)
- `src/lib/job-calendar.ts` [NEW] → creates a Google Calendar event, stores the returned `eventId` on the relevant `JobStatusEvent`
- Surface "Add to Calendar" as a manual button on `JobDetailSheet` too, for cases the parser misses

**Shipped:** `calendar.events` added to `GMAIL_SCOPES` (`src/lib/gmail.ts`), which was refactored to share one authorized-client helper between a Gmail client and a new `getCalendarClient()` — no duplicated token-refresh logic. `src/lib/job-calendar.ts` (`createJobCalendarEvent` / `deleteJobCalendarEvent`), a new API route (`/api/admin/jobs/[id]/calendar`, POST + DELETE), store actions (`addJobToCalendar`, `removeJobFromCalendar`), and an "Add to Calendar" / "View in Calendar" / "Remove" button trio in `JobDetailSheet`, with a small dialog for title/start/duration/description. `tsc`, `eslint`, `next build` all pass; smoke-tested (401 on the new route when unauthenticated, no stale-client 500s).

**Deviation from spec:** the calendar event id/link live on `JobApplication` (`calendarEventId`, `calendarEventLink`) rather than on the "relevant `JobStatusEvent`" — a job only ever has one active scheduled interview at a time in this model, and attaching it to a specific event row raised the question of *which* event without adding real value. Simpler to reason about as a job-level field.

**Date-guessing is deliberately not automatic.** `guessInterviewDateTime` (moved to `src/app/admin/dashboard/jobs/_components/job-date-guess.ts` — a dependency-free module, since `job-calendar.ts` pulls in Prisma + googleapis and can't reach the browser bundle) only *prefills* the "Add to Calendar" dialog from the job's notes/event history; the admin always reviews and confirms before an event is actually created. A wrong silent auto-scheduled interview is worse than no event at all.

**Required two manual one-time steps before this worked — both now done and confirmed working end-to-end:**
1. Reconnect Gmail (disconnect + reconnect via the Messages page) so the OAuth grant includes the new `calendar.events` scope — the old connection only had `gmail.send` + `gmail.readonly`.
2. Enable the **Google Calendar API** for the Google Cloud project behind `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (APIs & Services → Library → "Google Calendar API" → Enable). Granting the OAuth scope isn't enough on its own — the API also has to be turned on for the project, same as any other Google API. This surfaced as a 403 (`Google Calendar API has not been used in project ... or it is disabled`) even after the scope reconnect succeeded.

Verified live: "Add to Calendar" successfully creates a real event on the connected Google Calendar.

---

## Phase 5 — Browser extension (captures the sources Gmail scanning can't) ✅ COMPLETE

Separate mini-project (own folder, e.g. `extension/`), not part of the Next.js build.

- Manifest V3 Chrome extension, content scripts for LinkedIn job pages, Greenhouse, Lever, Workday, generic career pages
- Scrapes: job title, company, URL, location, salary (if visible), deadline, company logo
- "Save to mhrazu.com" popup button → `POST /api/admin/jobs/import` [NEW route, same auth pattern but needs a long-lived API token instead of session cookies — add a simple `JOB_IMPORT_TOKEN` env var checked in the route, since a browser extension can't carry the admin session cookie]
- This is the biggest scope item — build only after Phases 1–3 are validated in daily use

**Shipped:** `src/app/api/admin/jobs/import/route.ts` (bearer-token auth via `JOB_IMPORT_TOKEN`, zod validation built from the existing `job-constants.ts` enums, dedup by `jobUrl`, creates a `JobStatusEvent` with `source: "extension"`, always lands at `status: "found"`). A fully vanilla-JS Manifest V3 extension at `extension/` — no bundler, no npm deps: `manifest.json`, generated placeholder icons, `shared/scrape-utils.js` (schema.org `JobPosting` JSON-LD parsing tried first, salary-regex fallback), content scripts for `linkedin.js`/`greenhouse.js`/`lever.js`/`workday.js` (Workday polls up to 4s since it's an async-rendering SPA), a popup (editable prefilled form + "Save to mhrazu.com") that falls back to an on-demand `chrome.scripting.executeScript` generic JSON-LD scrape on unrecognized domains, an options page storing `apiBaseUrl`/`apiToken` in `chrome.storage.sync`, and a minimal `background.js` service worker (opens the options page on install). `tsc`, `eslint`, and `next build` all pass clean. Verified end-to-end against the running dev server with curl: no/wrong token → 401, valid payload → job + `extension`-sourced event created, same `jobUrl` resubmitted → `duplicate: true` with no second row, missing required field → 400 with a zod field error.

**Deviation from spec:** this is the only `/api/admin/*` route with request-body validation (zod) — every other admin route trusts its own session-authed UI and does none; this one accepts input from outside that boundary so it can't make that assumption.

**Not built / left for real-world use:** the extension hasn't been loaded against a live LinkedIn/Greenhouse/Lever/Workday page yet — selectors (especially LinkedIn's, which are known to drift) are untested against real markup and may need adjustment the first time they're tried for real. `.env.example` documents `JOB_IMPORT_TOKEN`; the local `.env` already has a generated value for testing — production needs its own value set before the extension is used against `mhrazu.com`.

---

## Phase 6 — AI assistant

Provider decision made: `openai` npm SDK routed through **OpenRouter** (`baseURL: "https://openrouter.ai/api/v1"`) with a free-model fallback list — no OpenAI billing, reusing a pattern already proven in another of the user's projects. Of the four sub-features below, only 6.1 is built so far.

- JD paste → parse into a draft `JobApplication` (company/position/location/salary/requirements) ✅ COMPLETE (6.1)
- Resume-to-JD match scoring — not started
- Cover letter drafting from `longBio`/`Skill`/`Project` data already in the CMS — not started
- Follow-up reminder suggestions based on `JobStatusEvent` time-since-last-update — not started

### 6.1 — JD parsing ✅ COMPLETE

**Shipped:** `openai` added as a dependency. `src/lib/job-jd-parser.ts` (`parseJobDescription`) — builds an `OpenAI` client pointed at OpenRouter, tries a hardcoded list of 7 free models in order (skips to the next on 429/402/404/rate-limit/no-endpoints, throws immediately on 401/auth error), system prompt requests a raw JSON object (`company`/`position`/`location`/`salaryMin`/`salaryMax`/`salaryCurrency`/`workMode`/`jobUrl`/`notes`, `null` for anything not literally present — no guessing), response parsing strips a possible markdown fence and defensively validates each field. `src/app/api/admin/jobs/parse-jd/route.ts` — unlike the Phase 5 import route, this is called from the authenticated dashboard UI itself, so it uses the normal `verifyAdmin()` session pattern, not a bearer token; zod-validates the input (min 20 chars). `AddJobDialog.tsx` got a collapsed-by-default "Paste a job description to prefill" section (create mode only) — a textarea + "Parse with AI" button that merges returned fields into the existing form state (only overwriting fields the AI actually returned, never clobbering something already typed) and lets the admin review/edit before the unchanged existing submit path runs. The AI never talks to Prisma directly — parsing only ever produces a prefill.

`tsc`, `eslint`, and `next build` all pass clean. Verified end-to-end against the running dev server with a real logged-in session cookie: unauthenticated → 401, too-short description → 400 (zod), valid-length description with no `OPENROUTER_API_KEY` configured → 502 with a clear "AI parsing isn't configured" message. **Not yet verified: an actual successful parse** — that needs a real `OPENROUTER_API_KEY` (OpenRouter account) set in `.env`, which the user needs to provide/generate themselves before trying it live through the dashboard UI.

---

## Suggested execution order

1. **Phase 1** ✅ — ship this first, it's independently useful with zero automation risk
2. **Phase 2** ✅ — cheap, high value, no new infra
3. **Phase 3** ✅ — highest leverage automation, reuses infra that already exists
4. **Phase 4** ✅ — calendar sync, confirmed working end-to-end live
5. **Phase 5** ✅ — browser extension, built and curl-verified end-to-end; real-world selector testing against live job pages is the next thing to validate in daily use
6. **Phase 6.1** ✅ — JD parsing via OpenRouter, curl-verified end-to-end except the live model call itself (needs a real `OPENROUTER_API_KEY`)
7. **Phase 6.2–6.4** — resume-match scoring, cover-letter drafting, follow-up reminders — remaining, picked up in a later session
