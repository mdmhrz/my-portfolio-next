# CMS Execution Tracker
> Derived from `cms-100-plan.md`. Tracks what is DONE vs LEFT.
> Last updated during execution.

## Legend
- ✅ Done  🔧 In progress  ⬜ TODO

---

## Phase 1 — Critical Fixes
- ✅ Schema: `subject` on Message, `featured` on Project (migration applied: `add_featured_subject_about_settings_skills`)
- ✅ 1.1 Contact: add `subject` to contact API zod+create + Contact.tsx input
- ✅ 1.2 ProjectsTab: Featured toggle + badge; CaseStudies: filter by `featured === true`; featured carried in projects routes
- ✅ 1.3 Remove static fallback: Experience.tsx Xgenious block + CaseStudies `|| projects` fallback
- ✅ 1.4 `revalidatePath` in banner/experiences/projects/blogs mutation routes

## Phase 2 — Cloudinary Image Upload
- ✅ 2.1 `cloudinary` core SDK installed (pnpm) — correct tool for server-side buffer upload
- ✅ 2.2 Env var placeholders appended to `.env` (USER must fill cloud name + key + secret)
- ✅ 2.3 `src/app/api/admin/upload/route.ts` POST (admin-guarded, FormData → upload_stream)
- ✅ 2.4 `src/components/admin/ImageUpload.tsx` (drag-drop, preview, clear, progress)
- ✅ 2.5 Wired into ProjectsTab + BlogsTab + AboutTab(avatar)

## Phase 3 — Blog Frontend
- ✅ Blog pages exist (`src/app/blog/page.tsx`, `[slug]/page.tsx`); react-markdown v10
- ✅ 3.1 `remark-gfm` + `rehype-highlight` + `highlight.js` installed; github-dark theme imported
- ✅ 3.2 Listing + detail pages finished; fixed `code` component for react-markdown v10 (no `inline` prop)
- ✅ 3.3 Navbar + Footer "Blog" links (route links bypass smooth-scroll handler)

## Phase 4 — New Models (About / SiteSettings / Skill)
- ✅ Schema + migration (applied, DB up to date)
- ✅ Zustand store (state + fetch/CRUD + setters)
- ✅ 4.2 API routes: `about`, `settings`, `skills`, `skills/[id]`
- ✅ 4.4 Tab components: AboutTab, SkillsTab, SettingsTab
- ✅ 4.5 Wire tabs: nav-items.ts + DashboardClient.tsx + dashboard page.tsx
- ✅ 4.6 Frontend: Journey (about.bio), Tools (skills cluster), CTA (settings + about.availability), PortfolioHome + page.tsx fetch

## Phase 5 — UI Polish (deferred)
- ⬜ AlertDialog deletes, auto-slug, fix `any` types, MD editor, Overview tab, dnd reordering
