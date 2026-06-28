# Portfolio + CMS — Mobarak Hossain Razu

A production-grade developer portfolio with a fully dynamic, database-driven admin CMS. Every section of the public site (hero, journey, experience, skills, case studies, CTA, footer, blog) is editable from a secure admin dashboard — no hardcoded content, no redeploy to update copy.

Built with **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma + PostgreSQL**, **Better-Auth**, and **Cloudinary**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database & Prisma](#database--prisma)
- [Authentication](#authentication)
- [Image Uploads (Cloudinary)](#image-uploads-cloudinary)
- [The Admin CMS](#the-admin-cms)
- [Blog System](#blog-system)
- [SEO & Metadata](#seo--metadata)
- [Production Deployment](#production-deployment)
- [Available Scripts](#available-scripts)
- [Notes](#notes)

---

## Overview

This project is two things in one:

1. **A public portfolio** — an animated, design-forward single-page site (`/`) with smooth scrolling, a 3D/interactive hero, scroll-spy navigation, and a full-featured public blog (`/blogs`, `/blogs/[slug]`).
2. **A headless CMS** — an authenticated admin dashboard (`/admin/dashboard`) that manages every piece of content. All mutations go through protected REST API routes and invalidate Next.js's cache so the public site reflects changes immediately.

There are **no static fallbacks** in the UI — if data isn't in the database, the section renders empty (or a graceful empty state). Everything is driven by PostgreSQL via Prisma.

---

## Features

### Public site
- **Animated hero** with interactive shaders (Three.js / React Three Fiber), 3D environment scene, and a typographic intro loader.
- **Smooth scrolling** powered by Lenis, with GSAP/Motion-driven scroll reveals.
- **Dynamic sections** — Hero Banner, Journey, Experience, Skills, Case Studies, CTA, Contact, Footer — all rendered from the database.
- **Architecture Showcase** — per-project architecture diagrams and metrics driven from the admin.
- **Tech Marquee** — animated scrolling marquee of tech stack icons.
- **Terminal** and **Code Card** decorative sections for developer personality.
- **3D Environment** scene powered by React Three Fiber and custom GLSL shaders.
- **Case Studies** filtered by a `featured` flag managed in the admin.
- **Contact form** that stores messages (with subject, type, and read state) into the database.
- **Dark/light theme** via `next-themes`.
- **Custom cursor** and magnetic-button micro-interactions.
- SEO-friendly, fully responsive layout.

### Public blog (`/blogs`, `/blogs/[slug]`)
- **Blog listing** with tag and category filtering (`/blogs?tag=...`).
- **Rich article pages** with:
  - Sticky **Table of Contents** with scroll-spy (auto-generated from H2/H3 headings).
  - **Reading progress bar** (sticky top indicator).
  - **View counter** — persisted to the database, displayed live.
  - **Share buttons** for social sharing.
  - **Prev / Next article** navigation.
  - **Related articles** (same category, fallback to latest).
  - **Cover image** with `next/image` optimisation.
  - **Custom code blocks** with copy button and syntax highlighting (GitHub Dark theme).
  - **Inline code** styled distinctly from block code.
- **GitHub-Flavored Markdown** (tables, strikethrough, task lists via `remark-gfm`).
- **Syntax highlighting** via `rehype-highlight` + `highlight.js`.
- **Heading anchors** via `rehype-slug`.
- Full **OpenGraph / Twitter Card** metadata per post.
- **JSON-LD `BlogPosting` structured data** for search engines.
- **Canonical URLs** per article.

### Admin CMS (`/admin/dashboard`)
- Secure **email/password auth** (Better-Auth) with an admin-only role gate.
- Dedicated pages (not just tabs) for each content type — each has its own URL, making deep-linking and bookmarking work.
- **Dedicated blog editor** (`/admin/dashboard/blogs/new`, `/admin/dashboard/blogs/[id]/edit`) with:
  - **MDXEditor** WYSIWYG toolbar (bold, italic, headings, lists, blockquotes, code blocks, tables, links, thematic breaks, undo/redo).
  - **Cloudinary image insert** button wired into the editor toolbar.
  - Live **word count** and **reading time** display in the sidebar.
  - Full **SEO metadata** fields (meta title, meta description, OG image, tags, category).
  - **Publish / draft** toggle with featured flag.
  - Auto **slug generation** from the title.
- **Cloudinary image uploads** with drag-and-drop, live preview, and progress in Projects, Blogs, and About.
- **Cloudinary image deletion** via `DELETE /api/admin/delete-image` (removes from CDN and DB).
- **Featured toggle** on projects to control homepage case studies; on blogs to surface highlighted posts.
- **Inbox** for contact messages with read/unread tracking.
- Full **CRUD** for all content types, backed by a Zustand store hydrated from server data.
- Shared admin UI primitives: `DataTable`, `Pagination`, `RowActionsMenu`, `DeleteDialog`, `PageHeader`, skeleton loaders.
- Responsive layout — `DesktopSidebar` + collapsible `MobileSidebar` sheet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS v4, Radix UI / shadcn |
| Animation | Motion, GSAP, Three.js / R3F, Lenis |
| State | Zustand, React Hook Form + Zod |
| Database | PostgreSQL + Prisma ORM (v6) |
| Auth | Better-Auth (email & password, role-based) |
| Media | Cloudinary (server-side uploads + deletion) |
| Blog editor | @mdxeditor/editor (WYSIWYG with CodeMirror blocks) |
| Markdown | react-markdown, remark-gfm, rehype-highlight, rehype-slug |
| TOC / slugs | github-slugger |
| HTTP client | axios |
| Icons | Phosphor, lucide-react |
| Package manager | pnpm |

---

## Project Structure

```
my-app/
├── prisma/
│   ├── schema.prisma          # All data models
│   ├── migrations/            # Versioned SQL migrations
│   └── seed.ts                # Idempotent seed (admin user + content defaults)
├── public/                    # Static assets & default project images
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public homepage (server, fetches from Prisma)
│   │   ├── sitemap.ts         # Dynamic XML sitemap (homepage + all published blog posts)
│   │   ├── robots.ts          # robots.txt — allows / and /blogs/, disallows /admin/ /api/
│   │   ├── opengraph-image.tsx # Default OG image generation
│   │   ├── _components/       # Public homepage section components
│   │   │   ├── Hero.tsx
│   │   │   ├── Journey.tsx
│   │   │   ├── Experience.tsx
│   │   │   ├── CaseStudies.tsx
│   │   │   ├── ArchitectureShowcase.tsx
│   │   │   ├── ProjectDetailsModal.tsx
│   │   │   ├── TechMarquee.tsx
│   │   │   ├── Tools.tsx
│   │   │   ├── Terminal.tsx
│   │   │   ├── CodeCard.tsx
│   │   │   ├── Environment3D.tsx
│   │   │   ├── Scene.tsx
│   │   │   ├── shaders/       # GLSL shaders (env.frag.ts, env.vert.ts)
│   │   │   ├── CTA.tsx
│   │   │   └── Contact.tsx
│   │   ├── blogs/
│   │   │   ├── page.tsx       # Blog listing with tag/category filter
│   │   │   ├── layout.tsx     # Blog-specific layout (own navbar, footer)
│   │   │   ├── [slug]/page.tsx # Article detail with TOC, view counter, share, related
│   │   │   └── _components/
│   │   │       ├── BlogListClient.tsx   # Client-side filter UI
│   │   │       ├── BlogTOC.tsx          # Scroll-spy table of contents
│   │   │       ├── BlogProgressBar.tsx  # Reading progress indicator
│   │   │       ├── BlogViewCounter.tsx  # Fires view increment on mount
│   │   │       ├── BlogShareButtons.tsx # Social share links
│   │   │       ├── BlogCodeBlock.tsx    # Code block with copy button
│   │   │       ├── BlogNavbar.tsx
│   │   │       └── BlogFooter.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx            # Dashboard root
│   │   │       ├── _components/        # Shell, topbar, sidebars, image upload
│   │   │       ├── banner/             # Hero banner management
│   │   │       ├── about/              # About / bio management
│   │   │       ├── experience/         # Work experience management
│   │   │       ├── projects/           # Projects management
│   │   │       ├── skills/             # Skills management
│   │   │       ├── settings/           # Site settings (CTA, footer)
│   │   │       ├── messages/           # Inbox management
│   │   │       └── blogs/
│   │   │           ├── page.tsx        # Blog list
│   │   │           ├── new/page.tsx    # Create new post
│   │   │           ├── [id]/edit/page.tsx  # Edit existing post
│   │   │           └── _components/
│   │   │               ├── BlogEditor.tsx        # MDXEditor + Cloudinary integration
│   │   │               ├── BlogEditorTopbar.tsx  # Save / publish controls
│   │   │               ├── BlogEditorSidebar.tsx # SEO, tags, cover image
│   │   │               └── BlogsPageContents.tsx # Blog list table
│   │   └── api/
│   │       ├── auth/[...auth]/  # Better-Auth handler
│   │       ├── contact/         # Public contact form submissions
│   │       ├── blogs/
│   │       │   └── [slug]/views/route.ts  # POST — increment view counter
│   │       └── admin/
│   │           ├── banner/        # GET + PUT
│   │           ├── about/         # GET + PUT
│   │           ├── experiences/   # GET + POST + [id] PATCH/DELETE
│   │           ├── projects/      # GET + POST + [id] PATCH/DELETE
│   │           ├── skills/        # GET + POST + [id] PATCH/DELETE
│   │           ├── blogs/         # GET + POST + [id] PATCH/DELETE
│   │           ├── messages/      # GET + [id] PATCH/DELETE
│   │           ├── settings/      # GET + PUT
│   │           ├── upload/        # POST — Cloudinary upload
│   │           └── delete-image/  # DELETE — Cloudinary image removal
│   ├── components/
│   │   ├── admin/               # Shared admin UI primitives
│   │   │   ├── DataTable.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── RowActionsMenu.tsx
│   │   │   ├── DeleteDialog.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── CardGridSkeleton.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   └── FormPageSkeleton.tsx
│   │   ├── global/              # Navbar, Footer, IntroLoader, SmoothScroll, etc.
│   │   └── ui/                  # shadcn primitives
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth-client.ts
│   │   ├── auth-helpers.ts      # verifyAdmin() guard
│   │   ├── cloudinary.ts
│   │   ├── api-client.ts
│   │   ├── image-naming.ts      # Cloudinary public_id naming helpers
│   │   └── utils.ts
│   ├── store/
│   │   └── usePortfolioStore.ts # Zustand store (all content types)
│   └── data/
│       └── projects.ts          # Frontend type definitions
├── next.config.ts
├── tailwind / postcss config
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js 18.18+** (developed on Node 20/24)
- **pnpm** (a `pnpm-lock.yaml` is committed; do not mix with npm/yarn)
- A running **PostgreSQL** database (local, Docker, or managed)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment variables
Copy the example and fill it in (see [Environment Variables](#environment-variables)):
```bash
cp .env.example .env   # then edit .env
```

### 3. Set up the database
```bash
# Create the schema / apply migrations
pnpm prisma migrate dev

# Generate the Prisma Client
pnpm prisma generate

# Seed: admin user + homepage content defaults
pnpm seed
```

### 4. Run the dev server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000). The admin is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

---

## Environment Variables

All variables live in `.env` (never committed). Required keys:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/portfolio-db?schema=public"

# Better-Auth
BETTER_AUTH_SECRET="generate-a-long-random-string"
BETTER_AUTH_URL="http://localhost:3000"          # your canonical app URL

# Cloudinary (image uploads + deletion) — optional to run, required to upload
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional: social login & payments (only if you enable them)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
STRIPE_SECRET_KEY=""

# Database seed — default admin user created on first seed (use a strong password!)
SEED_ADMIN_EMAIL=""
SEED_ADMIN_PASSWORD=""
SEED_ADMIN_NAME=""
```

> **`BETTER_AUTH_URL`** must match the canonical URL of the environment (e.g. `https://mhrazu.com` in production). The configured trusted origins include `localhost:3000`, `mhrazu.com`, and `www.mhrazu.com`.

---

## Database & Prisma

Provider: **PostgreSQL**. The Prisma schema (`prisma/schema.prisma`) defines all models:

- **Auth** — `User`, `Session`, `Account`, `Verification` (managed by Better-Auth; `User.role` gates admin access)
- **Content** — `Banner`, `Experience`, `Project`, `Blog`, `Message`
- **Singletons** — `About`, `SiteSettings` (single-row, upserted)
- **Collections** — `Skill` (grouped by category, ordered)

### Key model fields

**`Blog`** — `title`, `slug`, `content` (Markdown), `excerpt`, `coverImage`, `category`, `tags[]`, `featured`, `published`, `readingTime`, `views`, `metaTitle`, `metaDescription`

**`Project`** — `slug`, `title`, `desc`, `fullDesc`, `tech[]`, `features[]`, `contributions[]`, `image`, `featured`, `architectureTitle`, `architectureDesc`, `architectureTree`, `metrics` (JSON), `span`, `order`, `experienceId`

**`Banner`** — `name`, `title`, `description`, `chips[]`, `backgroundImg`, social links

**`About`** — `bio`, `longBio`, `resumeUrl`, `avatarUrl`, `location`, `availability`

**`SiteSettings`** — `ctaHeadline`, `ctaSubtext`, `footerText`

**`Skill`** — `name`, `category`, `icon`, `order`

**`Message`** — `name`, `email`, `subject`, `type`, `message`, `read`

Common commands:

```bash
pnpm prisma migrate dev     # create + apply a migration during development
pnpm prisma migrate deploy  # apply pending migrations (use in production/CI)
pnpm prisma generate        # regenerate the typed client after schema changes
pnpm prisma studio          # browse/edit data in a local GUI
pnpm prisma migrate status  # check if the DB is in sync with migrations
```

### Seeding
`prisma/seed.ts` is **idempotent** and safe to run on a database that already has data:
- Creates a default **admin user** from `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` (these **must** be set in `.env`; the seed aborts with a clear error if missing).
- Seeds **homepage content** (banner, Xgenious experience, four projects) — only rows that don't already exist.
- Flags the **case-study projects** (`nexdrop`, `taskip`) as `featured`.
- Creates default **About** and **SiteSettings** singletons (only if missing — never overwrites your edits).
- Seeds a **starter skill set** (only if the skills table is empty).

Run it any time:
```bash
pnpm seed          # or: pnpm prisma db seed
```

---

## Authentication

Authentication uses **Better-Auth** with the Prisma adapter:

- Email & password sign-in (`/admin/login`).
- `User.role` (`"user"` | `"admin"`) is a custom field; the dashboard and all `/api/admin/*` mutation routes require `role === "admin"` (enforced via `verifyAdmin()` in `src/lib/auth-helpers.ts`).
- Sessions are signed with `BETTER_AUTH_SECRET` and scoped to `BETTER_AUTH_URL`.

The default seeded admin is for first-run convenience — **set a strong password before going live**.

---

## Image Uploads (Cloudinary)

Image fields in the admin use a drag-and-drop **ImageUpload** component that streams files to Cloudinary via a protected route (`POST /api/admin/upload`). It returns a hosted URL stored on the model.

- Uploads are **admin-gated**.
- The route reads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. If unset, the app still runs — uploads return a clear configuration error.
- **Image deletion** is supported via `DELETE /api/admin/delete-image` — removes the asset from Cloudinary CDN and clears the URL in the database.
- Wired into **Projects** (cover), **Blog posts** (cover image + inline editor images), and **About** (avatar).

---

## The Admin CMS

- **Route:** `/admin/dashboard` (redirects to `/admin/login` when unauthenticated).
- Server component fetches initial data from Prisma and hydrates a Zustand store on the client; subsequent edits hit the REST API and update the store optimistically.
- Every mutation route calls `revalidatePath("/")` (and `/blogs` for posts) so the public site refreshes immediately — important for ISR/Vercel caching.
- Dashboard sections are **dedicated pages** (not just tabs), each accessible via its own URL.

### Sections

| Section | Route | Description |
|---|---|---|
| Hero Banner | `/dashboard/banner` | Name, title, description, chips, background image, social links |
| About | `/dashboard/about` | Bio, long bio, avatar, resume URL, location, availability |
| Experience | `/dashboard/experience` | Work history with company logo, role, timeline, description |
| Projects | `/dashboard/projects` | Full project detail with tech, features, architecture, metrics |
| Skills | `/dashboard/skills` | Skills grouped by category with icons and ordering |
| Blog Posts | `/dashboard/blogs` | CRUD + rich editor; separate `/new` and `/[id]/edit` pages |
| Site Settings | `/dashboard/settings` | CTA headline, subtext, footer text |
| Inbox | `/dashboard/messages` | Contact form messages with read/unread tracking |

---

## Blog System

The blog is a first-class feature with its own layout, admin editor, and public reader.

### Admin editor (`/admin/dashboard/blogs/new`, `/admin/dashboard/blogs/[id]/edit`)

- **MDXEditor** WYSIWYG: bold/italic/underline, headings, lists, blockquotes, code blocks (with CodeMirror language selector), tables, links, thematic breaks, undo/redo.
- **Cloudinary image insertion** — a custom toolbar button opens the drag-and-drop uploader.
- **Sidebar**: cover image, excerpt, category, tags (enter-to-add), featured/published toggles, meta title, meta description.
- **Topbar**: save draft, publish/unpublish, view post link.
- Live **word count** and **reading time** (stored in DB on save).
- Auto **slug** generation from title.

### Public reader (`/blogs/[slug]`)

- **Table of Contents** — auto-generated from H2/H3 headings, sticky on desktop, scroll-spy active state.
- **Reading progress bar** — fixed at the top, animates with scroll position.
- **View counter** — calls `POST /api/blogs/[slug]/views` on mount; count displayed in the header.
- **Share buttons** — copy link + social platforms.
- **Prev / Next navigation** — chronological links at the article footer.
- **Related articles** — same category, fallback to latest; shown in a 3-column grid below the article.
- **Custom code blocks** — syntax highlighting (GitHub Dark) with a one-click copy button.
- Full **OpenGraph + Twitter Card** metadata (`generateMetadata`).
- **JSON-LD `BlogPosting`** structured data.
- `generateStaticParams` for ISR pre-rendering of published posts (`revalidate = 3600`).

### Blog listing (`/blogs`)

- Server-rendered list of published posts.
- Client-side **tag** and **category** filtering via `BlogListClient`.
- Tag links in article detail pages (`/blogs?tag=react`) deep-link back to filtered listing.

---

## SEO & Metadata

| Feature | Implementation |
|---|---|
| Dynamic XML sitemap | `src/app/sitemap.ts` — homepage + all published blog slugs, revalidated hourly |
| robots.txt | `src/app/robots.ts` — allows `/` and `/blogs/`, disallows `/admin/` and `/api/` |
| OG image | `src/app/opengraph-image.tsx` — server-rendered default OG image |
| Per-post OG/Twitter | `generateMetadata` in `blogs/[slug]/page.tsx` — title, description, image, article dates |
| JSON-LD | `BlogPosting` schema injected per article |
| Canonical URLs | Set per article in `generateMetadata` |
| Alt text | `imageAlt`, `logoAlt`, `coverImageAlt`, `avatarAlt` fields on all media-holding models |

---

## Production Deployment

Recommended sequence for a fresh or existing production database:

```bash
# 1. Install (production deps)
pnpm install --frozen-lockfile

# 2. Apply any pending migrations (never use `migrate dev` in prod)
pnpm prisma migrate deploy

# 3. Generate the client & seed (idempotent — safe on existing data)
pnpm prisma generate
pnpm seed

# 4. Build & start
pnpm build
pnpm start
```

Deployment notes:
- Set all [environment variables](#environment-variables) in your host (Vercel, VPS, Docker, etc.).
- `BETTER_AUTH_URL` must be your production canonical URL.
- Ensure the Cloudinary variables are present before going live if you use image uploads.
- The public homepage is server-rendered dynamically; blog posts use ISR (`revalidate = 3600`); the sitemap revalidates hourly.

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production server |
| `pnpm lint` | Run ESLint |
| `pnpm seed` | Run the idempotent database seed |
| `pnpm prisma <cmd>` | Any Prisma command (`migrate`, `generate`, `studio`, …) |

---

## Notes

- **No npm/yarn** — this project uses **pnpm**. Mixing package managers will corrupt `node_modules`.
- **No static content fallbacks** — sections render from the DB. If a section looks empty, seed it or add content from the admin.
- **Case Studies** on the homepage are controlled by the `Project.featured` flag (toggle it in the Projects admin tab; the seed flags `nexdrop` and `taskip` by default).
- **Blog content** is authored via the WYSIWYG MDXEditor in the Blog Posts admin and rendered server-side as GitHub-flavored Markdown + syntax highlighting.
- **View counts** are incremented client-side on article mount and stored in `Blog.views`. The endpoint silently fails (returns `{ views: 0 }`) if the post is not found, so it is safe in development with empty seeds.
- **Architecture data** (`architectureTitle`, `architectureDesc`, `architectureTree`) and **metrics** (JSON) on projects power the `ArchitectureShowcase` section on the public homepage.

---

© Mobarak Hossain Razu — [mhrazu.com](https://mhrazu.com)
