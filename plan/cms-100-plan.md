# 100% CMS Implementation Plan
> Portfolio Admin Dashboard — Full Roadmap

---

## Phase 1 — Critical Bug Fixes (No new deps needed)

### 1.1 Add `subject` field to `Message` model
- `prisma/schema.prisma` → add `subject String?` to `Message`
- `src/app/api/contact/route.ts` → add subject to Zod + prisma.create
- `src/components/home/Contact.tsx` → add Subject input field
- Migration: `npx prisma migrate dev --name add_message_subject`

### 1.2 Add `featured` flag to `Project` model
- `prisma/schema.prisma` → add `featured Boolean @default(false)`
- Migration: `npx prisma migrate dev --name add_project_featured`
- `src/components/admin/ProjectsTab.tsx` → add Featured toggle
- `src/store/usePortfolioStore.ts` → add `featured` to `ProjectData`
- `src/components/home/CaseStudies.tsx` → filter by `p.featured === true`

### 1.3 Remove all static data fallbacks
- `src/components/home/CaseStudies.tsx` → remove `|| projects` fallback
- `src/components/home/Experience.tsx` → remove hardcoded Xgenious fallback

### 1.4 Add `revalidatePath` to all admin API routes
- All `src/app/api/admin/*/route.ts` files → call `revalidatePath("/")` after mutations

---

## Phase 2 — Cloudinary Image Upload

### 2.1 Install packages
```bash
npm install next-cloudinary
```

### 2.2 Environment variables
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2.3 Create upload API route
- `src/app/api/admin/upload/route.ts` [NEW] → POST, accepts FormData, uploads to Cloudinary, returns `{ url }`

### 2.4 Create `ImageUpload` component
- `src/components/admin/ImageUpload.tsx` [NEW]
  - Props: `value`, `onChange`, `label?`
  - Drag-drop or click file picker
  - Upload progress spinner
  - Live thumbnail preview
  - Clear button

### 2.5 Wire into existing tabs
- `src/components/admin/ProjectsTab.tsx` → replace `image` text input with `<ImageUpload />`
- `src/components/admin/BlogsTab.tsx` → replace `coverImage` text input with `<ImageUpload />`

---

## Phase 3 — Blog Frontend

### 3.1 Install packages
```bash
npm install remark-gfm rehype-highlight
```

### 3.2 Blog listing page
- `src/app/blog/page.tsx` [NEW] → Server component, fetch published blogs, render card grid

### 3.3 Blog detail page
- `src/app/blog/[slug]/page.tsx` [NEW] → fetch by slug, render Markdown with `react-markdown` + remark-gfm + rehype-highlight

### 3.4 Add blog link to navigation
- `src/components/shared/Navbar.tsx` → add "Blog" nav link
- `src/components/shared/Footer.tsx` → add "Blog" footer link

---

## Phase 4 — New CMS Models (About / SiteSettings / Skills)

### 4.1 Prisma schema additions
```prisma
model About {
  id           String   @id @default("singleton")
  bio          String
  longBio      String?
  resumeUrl    String?
  avatarUrl    String?
  location     String?
  availability String?
  updatedAt    DateTime @updatedAt
  @@map("about")
}

model SiteSettings {
  id          String   @id @default("singleton")
  ctaHeadline String?
  ctaSubtext  String?
  footerText  String?
  updatedAt   DateTime @updatedAt
  @@map("site_settings")
}

model Skill {
  id        String   @id @default(uuid())
  name      String
  category  String
  icon      String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  @@map("skill")
}
```
- Migration: `npx prisma migrate dev --name add_about_settings_skills`

### 4.2 New API routes
- `src/app/api/admin/about/route.ts` [NEW] — GET + POST (upsert singleton)
- `src/app/api/admin/settings/route.ts` [NEW] — GET + POST (upsert singleton)
- `src/app/api/admin/skills/route.ts` [NEW] — GET + POST
- `src/app/api/admin/skills/[id]/route.ts` [NEW] — PUT + DELETE

### 4.3 Zustand store additions
- `src/store/usePortfolioStore.ts` → add `about`, `settings`, `skills` + all CRUD actions

### 4.4 New admin tab components
- `src/components/admin/AboutTab.tsx` [NEW] — bio, longBio, resumeUrl, avatarUrl (ImageUpload), location, availability
- `src/components/admin/SkillsTab.tsx` [NEW] — skills table, add/edit/delete
- `src/components/admin/SettingsTab.tsx` [NEW] — CTA headline, CTA subtext, footer text

### 4.5 Wire new tabs into dashboard
- `src/components/admin/nav-items.ts` → add "about", "skills", "settings"
- `src/components/admin/DashboardClient.tsx` → render new tabs
- `src/app/admin/dashboard/page.tsx` → fetch and pass new initial props

### 4.6 Connect new models to frontend
- `src/components/home/Journey.tsx` → accept + use `about` prop
- `src/components/home/Tools.tsx` → accept + use `skills` prop
- `src/components/home/CTA.tsx` → accept + use `settings` prop
- `src/components/home/PortfolioHome.tsx` → pass new props
- `src/app/page.tsx` → fetch `about`, `settings`, `skills` from Prisma

---

## Phase 5 — UI Polish & Quality

### 5.1 Replace `window.confirm()` with `<AlertDialog>`
- `ExperienceTab.tsx`, `ProjectsTab.tsx`, `BlogsTab.tsx`, `MessagesTab.tsx` → all delete actions

### 5.2 Auto-generate slug from title
- `BlogsTab.tsx`, `ProjectsTab.tsx` → auto-slugify on title change, allow manual override

### 5.3 Fix `any` types
- All tab components → import proper interfaces from `@/store/usePortfolioStore`

### 5.4 Rich Markdown editor for blogs
```bash
npm install @uiw/react-md-editor
```
- `src/components/admin/BlogsTab.tsx` → replace textarea with `<MDEditor />`

### 5.5 Add Overview / Stats tab (default landing)
- `src/components/admin/OverviewTab.tsx` [NEW]
  - Stat cards: projects, experiences, blogs, unread messages
  - Recent messages preview
  - Quick-action buttons
- `src/components/admin/nav-items.ts` → add "overview" as first tab
- `src/components/admin/DashboardClient.tsx` → default to "overview"

### 5.6 Drag-and-drop reordering
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```
- `ExperienceTab.tsx`, `ProjectsTab.tsx` → dnd-kit sortable rows/cards

---

## Execution Order

| # | Phase | Priority |
|---|---|---|
| 1 | Critical Fixes | 🔴 Do first |
| 2 | Cloudinary Upload | 🔴 Do second |
| 3 | Blog Frontend | 🟡 Third |
| 4 | New DB Models + Tabs | 🟡 Fourth |
| 5 | UI Polish | 🟢 Last |

---

## New Files to Create

| File | Description |
|---|---|
| `src/app/api/admin/upload/route.ts` | Cloudinary upload endpoint |
| `src/app/api/admin/about/route.ts` | About CRUD |
| `src/app/api/admin/settings/route.ts` | SiteSettings CRUD |
| `src/app/api/admin/skills/route.ts` | Skills list + create |
| `src/app/api/admin/skills/[id]/route.ts` | Skills update + delete |
| `src/app/blog/page.tsx` | Blog listing page |
| `src/app/blog/[slug]/page.tsx` | Blog detail page |
| `src/components/admin/ImageUpload.tsx` | Cloudinary upload component |
| `src/components/admin/OverviewTab.tsx` | Dashboard overview/stats |
| `src/components/admin/AboutTab.tsx` | About section editor |
| `src/components/admin/SkillsTab.tsx` | Skills manager |
| `src/components/admin/SettingsTab.tsx` | Site settings editor |



🔴 The 5 Critical Fixes
1. Hardcoded fallbacks defeat the CMS
CaseStudies.tsx line 22 hardcodes p.id === "nexdrop" || p.id === "taskip" — so no matter what you set in the admin, those two static entries always appear. You need a featured: Boolean field on Project and filter by that instead.

2. Blog content goes nowhere
The Blog model, API, and admin tab all exist — but there's no /blog page. Content you write in the admin is stored but never rendered. You need /blog/page.tsx (listing) and /blog/[slug]/page.tsx (reader).

3. No image upload
Every image field is a raw text input for a URL/path. Renaming any file in public/ breaks things silently. You need Cloudinary or UploadThing integration.

4. No revalidatePath after mutations
Admin saves don't trigger Next.js ISR cache invalidation. On Vercel, visitors may see stale data.

5. subject field referenced but missing from schema
MessagesTab.tsx accesses msg.subject on 3 lines, but the Message model has no subject column → always shows "(No Subject)".

🟡 Biggest Medium Priority
SiteSettings/About/Skill DB models — TechMarquee, Tools, Journey, CTA, Footer are 100% hardcoded with no admin control
Real Markdown editor for blogs (replace the raw <textarea> with @uiw/react-md-editor)
Auto-slug generation from title
Replace window.confirm() with a proper <AlertDialog> for all delete actions
Fix any types — ExperienceData, ProjectData, etc. are already in the store but never imported into tab components
The full prioritized table is in the artifact above. Which of these would you like to tackle first?

Cms Analysis
9:55 PM
Ok, i will choose cloudinary to upload image. 
to do all of this make a plan markdown plan file  in plan folder and start working.
