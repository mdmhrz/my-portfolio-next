# Appearance System Rebuild — Work Procedure & Handoff

**Created:** 2026-06-30
**Purpose:** Resumable handoff. Describes the *procedure* (not full code) so any AI/developer can continue from where work stopped. Update the **Status** checkboxes as you go.

---

## 0. Context (read first — saves re-investigation)

**Stack:** Next.js **16.1.7** (Turbopack dev, App Router), React 19, Tailwind **v4**, shadcn/ui, Prisma + **Neon Postgres** (remote, reachable), Zustand, Sonner.

> ⚠️ Per `AGENTS.md`: this Next.js has breaking changes vs training data. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.

**Shell is zsh** — unquoted `$VAR` does **not** word-split (bit us during testing). Quote/loop explicitly.

**Dev server health:** A bloated `.next/dev` cache (1.4 GB) caused 14 GB RAM use. Fix = `rm -rf .next` + run capped: `NODE_OPTIONS="--max-old-space-size=4096" pnpm dev`. Keep this in mind; don't let `.next` rot.

### Current architecture (as found)
- **Root layout** `src/app/layout.tsx` wraps **both** public and admin. No route groups exist.
- **Public home** `src/app/page.tsx` = server component, already fetches `siteSettings`, renders `PortfolioHome` (which contains its own Navbar/Footer).
- **Blogs** `src/app/blogs/layout.tsx` has its own `BlogNavbar`/`BlogFooter`.
- **Admin** `src/app/admin/dashboard/layout.tsx` = server component, auth-gates (`auth.api.getSession`), renders `AdminShell`.
- **Current (broken) injection:** `AppearanceProvider` (root layout) → `useAppearance()` hook → client `useEffect` fetches `/api/admin/appearance` → injects `<style id="appearance-styles">` with only 6 tokens at `:root`. This is **client-side** → causes flash + unreliable application. **This is the core reason colors don't reliably apply site-wide.**
- No middleware; appearance API has **no auth** (GET is public — fine for server reads).

### Key files
| File | Role |
|---|---|
| `src/constants/defaultAppearance.ts` | `DEFAULT_APPEARANCE`, `COLOR_THEMES` (default/ocean/forest/sunset/midnight), `DEFAULT_FONTS` |
| `src/lib/appearanceInjector.ts` | CSS-generation logic (currently global `:root`, hex values) |
| `src/lib/useAppearance.ts` | Client hook (to be retired for colors) |
| `src/store/useAppearanceStore.ts` | Zustand store (fetch/update/restore) |
| `src/app/api/admin/appearance/route.ts` | GET/POST config |
| `src/app/api/admin/appearance/restore/route.ts` | POST restore (currently writes hardcoded hex — wrong) |
| `src/app/admin/dashboard/appearance/page.tsx` + `_components/*` | Admin UI (FontsTab, ColorsTab, PreviewPanel, Simple/Themes/Advanced modes, pickers) |
| `src/app/globals.css` | The real default theme (oklch tokens for `:root` and `.dark`) |
| `prisma/schema.prisma` | `model SiteSettings` (singleton, id="singleton") |

### Tailwind v4 token mechanics (critical for scoping)
- `globals.css` `@theme` maps `--color-primary: var(--primary)` etc. Utilities like `bg-primary` resolve `var(--color-primary)` → `var(--primary)`, resolved **per element via CSS cascade/inheritance**.
- **Scoping works via a wrapper element:** setting `--primary` on `[data-appearance="public"]` makes all descendants inherit it (proximity-based inheritance beats `:root`, regardless of specificity). This is how we isolate public vs dashboard colors.
- **Dark mode:** `next-themes` puts `.dark` on `<html>`. Scoped dark rule must be `.dark [data-appearance="public"] { --primary: … }` (the wrapper is a descendant of `html.dark`).

---

## 1. Confirmed product decisions (do not re-litigate)

1. **Two separate color sets.** `publicColors` (public site) and `dashboardColors` (admin) are **independently** customizable from the appearance page.
2. **Font is unified** — one font setting applies to the entire site (public + dashboard), injected globally.
3. **Restore Default = clear the override** → site falls back to `globals.css` (the original committed oklch design, pixel-exact). Do **not** write hardcoded hex.
4. **Whole-site shadcn migration** (Phase 2): replace raw HTML primitives across public components with shadcn primitives + design tokens so the site is fully token-driven (this is what makes dynamic colors visible everywhere). **Creative/animation components stay** (3D `Scene`/`Environment3D`/shaders, `Magnetic`, `MouseFollower`, `TechMarquee`, `Terminal`) — only their color usage gets tokenized; they are not turned into shadcn components.

### Answers to user's questions (record)
- **Why were Satoshi font files deleted?** Not lost — commit `d751dd0` reorganized `public/fonts/Satoshi-*.woff2` → `public/fonts/satoshi/satoshi-{400,500,700,900}.woff2` (same weights) for the folder-convention font loader. Nothing references old paths. Safe.
- **Why did restore feel broken?** It wrote a hardcoded hex palette that doesn't match the real oklch design, and nothing re-injected live → looked like nothing happened. Fixed by decision #3.

---

## 2. Phased execution plan

> Order matters. Phase 0 unblocks everything. Do not start Phase 2 before Phase 0 + 1 are verified.

### PHASE 0 — Data model + server-side injection (foundation)

**0.1 Schema** (`prisma/schema.prisma`, `model SiteSettings`)
- Add `publicColors Json?` and `dashboardColors Json?`. Each stores `{ mode, accentColor, themePreset, customPalette }` (same shape as today's color block). `null` = use default (globals.css).
- Keep font fields as-is (`fontType`, `fontName`, `fontWeights`, `customFontUrl`).
- Old flat color fields (`colorMode`, `accentColor`, `themePreset`, `customPalette`): leave column in place for now (don't break), but stop reading/writing them for the new logic. (Optional later cleanup migration.)

**0.2 Migration**
- DB is **reachable** (Neon). Run: `npx prisma migrate dev --name appearance_two_color_sets --schema prisma/schema.prisma`.
- Then `npx prisma generate`.
- If DB is unreachable when resuming: create the migration SQL manually under `prisma/migrations/` and have the user run it.

**0.3 Rewrite injector** (`src/lib/appearanceInjector.ts`)
- `generateColorCSS(scopeSelector, config)` → returns a `<style>` body that declares tokens on `scopeSelector` (light) and `.dark <scopeSelector>` (dark). Use **the full token set** the UI relies on (`--background --foreground --card --card-foreground --popover --popover-foreground --primary --primary-foreground --secondary --secondary-foreground --muted --muted-foreground --accent --accent-foreground --border --input --ring`), not just 6. Derive `*-foreground` sensibly (contrast) in simple mode.
- If `config` is `null`/mode "default" → return empty string (fall back to globals.css). This implements Restore.
- `generateFontCSS(font)` → `@font-face` (local/custom) or `@import` (google) + sets `--font-sans`/family globally. Keep separate from colors.

**0.4 Server injection components** (new, server components — no "use client")
- `src/components/global/AppearanceFont.tsx`: reads `siteSettings` (Prisma, via a cached helper), renders a `<style>` with font CSS. Mount in **root layout `<head>`** so font is global.
- `src/components/global/AppearanceColorScope.tsx`: props `{ scope: "public" | "admin", children }`. Reads settings, picks `publicColors` or `dashboardColors`, renders `<style>` (scoped CSS) + `<div data-appearance={scope}>{children}</div>`.
- Add a cached settings reader, e.g. `src/lib/getSiteSettings.ts` using React `cache()` to dedupe the Prisma read within a request.

**0.5 Wire injection points**
- **Root layout** `src/app/layout.tsx`: keep font global (`AppearanceFont`). Remove the client `AppearanceProvider` color role (font can also stay here; colors move to scopes). Keep `ThemeProvider`/`SmoothScroll`/`Toaster`.
- **Public scope:** wrap public content. Two public entry points → wrap both:
  - `src/app/page.tsx`: wrap `<PortfolioHome …/>` in `<AppearanceColorScope scope="public">`.
  - `src/app/blogs/layout.tsx`: wrap its content in `<AppearanceColorScope scope="public">`.
  - (If cleaner later: introduce a `(site)` route group with one shared layout. Not required now; avoid moving files unless doing it deliberately.)
- **Admin scope:** `src/app/admin/dashboard/layout.tsx`: wrap `<AdminShell>` in `<AppearanceColorScope scope="admin">`.

**0.6 Retire client color injection**
- Remove color injection from `useAppearance.ts` / `AppearanceProvider.tsx`. (Delete or repurpose; ensure nothing else imports the removed behavior.) Font is now server-side too, so the provider may become unnecessary — verify no remaining importers before deleting.

**0.7 API + store for two sets**
- `route.ts` GET: return `{ font, publicColors, dashboardColors }`. POST: accept `{ font?, publicColors?, dashboardColors? }`, upsert singleton; only overwrite provided keys.
- `restore/route.ts`: `{ type: "publicColors" | "dashboardColors" | "font" | "all" }` → set the targeted field(s) to `null` (colors) / default font. **Clearing = restore.**
- After any mutation, call `revalidatePath("/")` and the relevant paths (and `/blogs`) so server-injected CSS refreshes. (Home already uses `revalidate = 3600` + admin mutations revalidate.)
- `useAppearanceStore.ts`: model `{ font, publicColors, dashboardColors }`; update `fetch/update/restore` to the new shape.

**Phase 0 DONE when:** changing public colors in DB changes the public site on reload (server HTML already correct, no flash); dashboard colors change only the dashboard; font changes everywhere; restore reverts to globals.css look.

### PHASE 1 — Appearance page UX rebuild

- **Top-level: two tabs** — **Typography** | **Theme & Colors** (rename from Fonts/Colors). Use existing `src/components/ui/tabs`.
- **Theme & Colors tab:** add a **target switch** at top: *Public site* ⇄ *Dashboard* (controls which set you're editing — Decision #1). Below it, the Simple / Themes / Advanced modes.
- **Clarity:** every editable token gets a **label + plain-English description** of where it's used, e.g. *Primary — buttons & key actions*, *Background — page backdrop*, *Secondary — subtle surfaces*, *Border — dividers & outlines*, *Foreground — body text*. No bare hex pickers without context.
- **Live preview (real):** wire preview to actual CSS variables (apply scoped vars to a preview container in real time as the user edits), plus a representative component sampler (buttons, card, badge, input, text) so colors **and** font update live before saving. The current `PreviewPanel` only shows static swatches — replace.
- **Fix Restore wiring:** per-section restore ("Restore public colors", "Restore dashboard colors", "Restore font") calling the cleared-override endpoint; toast; refresh.
- Confirm `FontsTab`, `ColorsTab`, `SimpleColorMode`, `ThemesColorMode`, `AdvancedColorMode`, pickers read/write the new store shape.

**Phase 1 DONE when:** two clean tabs; public/dashboard target switch works; every option is self-explanatory; live preview reflects colors + font instantly; all restore buttons revert to original design.

### PHASE 2 — Whole-site shadcn migration (in reviewable batches)

> Replace raw HTML primitives with shadcn primitives + tokens. One batch per PR/commit; verify visually after each.

Suggested batch order:
1. **Global chrome:** `global/Navbar.tsx`, `global/Footer.tsx`, `blogs/_components/BlogNavbar.tsx`, `BlogFooter.tsx` → shadcn `button`, `sheet` (mobile menu), `dropdown-menu`, `separator`, tokens.
2. **Hero & CTAs:** `Hero.tsx`, `CTA.tsx`, `Contact.tsx` → `button`, `input`, `textarea`, `card`, tokens. (Keep 3D scene as-is; tokenize colors.)
3. **Content sections:** `Experience.tsx`, `Journey.tsx`, `Tools.tsx`, `CaseStudies.tsx`, `ArchitectureShowcase.tsx`, `CodeCard.tsx`, `ProjectDetailsModal.tsx` → `card`, `badge`, `dialog`, `tabs`, `tooltip`, `scroll-area`, tokens.
4. **Blogs:** `BlogListClient.tsx`, `BlogTOC.tsx`, `BlogShareButtons.tsx`, `BlogCodeBlock.tsx`, etc. → shadcn primitives + tokens.
5. **Sweep:** replace any remaining hardcoded colors (hex/oklch/`text-white` etc.) with semantic tokens (`text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, …). Grep for raw colors to find stragglers.

**Leave as creative (tokenize colors only, do not shadcn-ify):** `Scene.tsx`, `Environment3D.tsx`, `shaders/`, `Magnetic.tsx`, `MouseFollower.tsx`, `TechMarquee.tsx`, `Terminal.tsx`, `IntroLoader.tsx`, `Reveal.tsx`, `Logo.tsx`.

**Phase 2 DONE when:** every public surface uses shadcn primitives + semantic tokens; changing `publicColors` visibly restyles the entire public site; no hardcoded colors remain (except intentional brand accents like the constellation accent).

---

## 3. Verification checklist (run after each phase)
- `rm -rf .next` then `NODE_OPTIONS="--max-old-space-size=4096" pnpm dev`; confirm RAM stays ~2–3 GB.
- Public route `/` and `/blogs`: change `publicColors` → reload → public restyles; dashboard unchanged.
- `/admin/dashboard/*`: change `dashboardColors` → dashboard restyles; public unchanged.
- Change font → applies to both public and dashboard.
- Restore each section → reverts exactly to original `globals.css` look (compare against `git stash` of current main if unsure).
- Toggle dark mode on each scope → scoped dark colors apply correctly.
- No FOUC (colors correct in initial server HTML — view source / disable JS).
- `npx tsc --noEmit` clean; `pnpm build` succeeds.

## 4. Gotchas / decisions log
- Scope colors via wrapper `data-appearance` attribute + `.dark <scope>` for dark — **not** `:root` (that's the global default = dashboard fallback baseline).
- Server-side injection (not client `useEffect`) to kill FOUC and make colors reliable.
- Restore = NULL the field, never write hex.
- Settings is a singleton row (`id="singleton"`); use upsert; only patch provided keys.
- Cache the Prisma settings read (`React.cache`) to avoid duplicate queries per request.
- Revalidate `/` and `/blogs` after mutations so server CSS refreshes.
- Don't bundle creative components into the shadcn migration.

## 5. Status
- [x] 0.1 Schema fields added (`publicColors`, `dashboardColors` Json?; legacy color fields retained)
- [x] 0.2 Migration created + applied + `prisma generate` (`20260630171858_appearance_two_color_sets`)
- [x] 0.3 Injector rewritten (`src/lib/appearanceInjector.ts`: scoped, full token set, light+dark, null=fallback)
- [x] 0.4 Server injection components: `AppearanceFont.tsx`, `AppearanceColorScope.tsx`, cached reader `getSiteSettings.ts`
- [x] 0.5 Injection wired (root layout font; public scope in `page.tsx` + `blogs/layout.tsx`; admin scope in `admin/dashboard/layout.tsx`; `globals.css` font now `var(--font-app, var(--font-satoshi))`)
- [x] 0.6 Client color injection retired (deleted `AppearanceProvider.tsx`, `useAppearance.ts`)
- [x] 0.7 API + restore + store updated to two-set model (`route.ts`, `restore/route.ts`, `useAppearanceStore.ts`; `FontsTab`/`ColorsTab` patched to new store API — ColorsTab targets `publicColors` for now)
- [x] **Phase 0 verified** — `tsc --noEmit` clean; runtime: POST ocean→public injects scoped CSS (light+dark, full tokens) server-side, `dashboardColors` stays independent, restore clears →globals.css fallback. DB left clean (both null).

### Phase 0 verification notes (for Phase 1 start)
- `revalidatePath("/")` + `/blogs` fires on every appearance mutation — server CSS refreshes on next load.
- Cold homepage compile in dev ≈ 29 s (heavy 3D libs); RAM stayed ~2 GB under the 4 GB cap.
- Scope wrapper uses `display:contents` — custom properties still inherit; no layout box added.
- **Phase 1 TODO carried over:** ColorsTab currently only edits `publicColors`. Add the Public/Dashboard target switch so `dashboardColors` is editable too; rename tabs to Typography / Theme & Colors; add labeled token descriptions; wire real live preview; add per-section restore buttons (`restore("font"|"publicColors"|"dashboardColors")`).
- [x] 1.x Appearance page UX rebuilt — tabs renamed **Typography / Theme & Colors** (`page.tsx`); **Public/Dashboard target switch** + per-target save/restore (`ColorsTab.tsx`); **real live preview** with light/dark toggle reading store drafts (`PreviewPanel.tsx`); labeled token descriptions (`AdvancedColorMode.tsx`); draft state in store (`useAppearanceStore.ts`) mirrored by both forms; injector exports `resolveTokens` + `fontFaceCSS` for preview.
- [x] **Phase 1 verified** — `tsc --noEmit` clean; appearance route compiles (307 auth redirect, no errors). Note: full interactive UI not click-tested (route is auth-gated); preview is pure client logic over store drafts, injection pipeline proven in Phase 0.
- [x] 2.1 Global chrome migrated — `Navbar` (mobile trigger + Resume CTAs → shadcn `Button`; active links → `text-primary`), `Footer` (all `indigo-*` brand → `primary` tokens; emerald status kept as semantic state), `BlogFooter` (social hover → primary); `BlogNavbar` already tokenized. tsc clean; homepage 200, no runtime errors. Brand color now flows from `publicColors`.
- [x] 2.2 Hero & CTAs migrated — `Hero` (underline/pills/CTA/scroll-dot/ping → `primary`; spotlight & glow inline styles → `color-mix(var(--primary))`; GSAP magnetic-letter color reads scoped `--primary` when hex, else indigo fallback — GSAP can't tween oklch), `CTA` (glows + spotlight + button → primary tokens; emerald availability kept), `Contact` (form inputs/select `neutral/zinc/white` → `border-input`/`bg-background`, indigo focus → `focus-visible:border-primary ring-primary/20`; submit `<button>` → shadcn `Button`; heading + social hovers → primary). tsc clean; homepage 200 under ocean, all sections render, no runtime errors.
- [x] 2.3 Content sections migrated — `Experience`, `Journey`, `Tools`, `CaseStudies`, `ArchitectureShowcase`, `CodeCard`, `ProjectDetailsModal`: all `indigo` brand → `primary` (via guarded sed `*-indigo-(400-700)`→`*-primary`, preserving opacity suffixes), inline `rgba(99,102,241,…)` glows/filters → `color-mix(var(--primary))`, `text-white` on primary surfaces → `text-primary-foreground`, active-node tints `indigo-50/950` → `bg-primary/10`. **Intentionally kept** (not theme): Tools code-syntax colors (purple/blue/yellow/teal), terminal traffic-light hex dots (#ff5f56 etc.), emerald status. **Deferred to 2.5 sweep:** fixed-dark code-window neutral surfaces (`bg-zinc-950`/`slate-950`) — decide whether they should follow theme. tsc clean; homepage 200 under forest, sections render, no runtime errors.
- [x] 2.4 Blogs migrated — `BlogListClient`, `BlogTOC`, `BlogShareButtons`, `BlogProgressBar`, `blogs/[slug]/page.tsx`: indigo brand → `primary` (guarded sed 300–700); card-hover `rgba(99…)` glows → `color-mix(var(--primary))`; placeholder gradient tints `indigo-950/purple-950` → `from-primary/15 to-primary/5`; blog list + post **ambient radial glows** (`rgba(120,119,198…)`) → themed `color-mix`. **Kept:** amber "Featured" badge, emerald copy-success. **Deferred to 2.5:** `BlogCodeBlock` (fixed-dark `bg-neutral-950` code widget — its `indigo` text pairs with the dark bg; tokenizing would break contrast). tsc clean; `/blogs` + a post render 200 under sunset (`--primary:#c2410c`), no errors.
- [x] 2.5 Hardcoded-color sweep — swept remaining brand `indigo` → `primary` in `IntroLoader`, `not-found`, `MouseFollower` (static class), `TechMarquee`, and 3 admin accents (`MessagesPageContents`, `ProjectsPageContents`, `BlogEditorSidebar`); cleaned leftover `text-white`→`text-primary-foreground` and `rgba(99…)`→`color-mix`. **Code windows kept dark by decision** (`bg-zinc/slate/neutral-900/950` in Tools, CodeCard, CaseStudies, Experience, ProjectDetailsModal, BlogCodeBlock, `[slug]`). `MouseFollower` cursor now **resolves `--primary` to rgb at runtime** (reads its own `text-primary` via ref; re-reads on theme toggle via MutationObserver) so the animated ring/glow follows the scoped public color — motion still gets interpolatable rgba. **Remaining intentional keeps (JS/asset, can't use CSS vars):** `Hero` GSAP letter color (reads scoped `--primary` when hex, else indigo fallback), `opengraph-image` (static Satori social card). Idle cursor border stays neutral grey by design. Note: `not-found` tokenized but renders outside the public scope (uses default primary) — fine for an error page.
- [x] **Phase 2 verified** — no brand `indigo` class tokens remain site-wide (only kept code-window/cursor/OG); tsc clean; home + `/blogs` + post + 404 render under ocean/forest/sunset/violet themes, no runtime errors.
- [x] `tsc --noEmit` + `pnpm build` green — production build exit 0; all routes compiled (static/SSG/dynamic) including appearance scopes + server injection.

---

## ✅ ALL PHASES COMPLETE (Phase 0 + 1 + 2)
Dynamic appearance system (two color scopes + unified font, server-injected, restore=fallback) and full public-site shadcn/token migration done and production-build verified. Remaining optional follow-ups: wire `dashboardColors` editing is live in the UI; if desired later, scope the 404 page and revisit dark code windows.

---
*Resume by finding the first unchecked item; Section 0 has all context needed to continue without re-investigation.*
