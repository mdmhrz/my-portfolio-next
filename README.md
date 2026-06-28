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
- [Production Deployment](#production-deployment)
- [Available Scripts](#available-scripts)
- [Notes](#notes)

---

## Overview

This project is two things in one:

1. **A public portfolio** — an animated, design-forward single-page site (`/`) with smooth scrolling, a 3D/interactive hero, scroll-spy navigation, and a public blog (`/blogs`, `/blogs/[slug]`).
2. **A headless CMS** — an authenticated admin dashboard (`/admin/dashboard`) that manages every piece of content. All mutations go through protected REST API routes and invalidate Next.js's cache so the public site reflects changes immediately.

There are **no static fallbacks** in the UI — if data isn't in the database, the section renders empty (or a graceful empty state). Everything is driven by PostgreSQL via Prisma.

---

## Features

### Public site
- **Animated hero** with interactive shaders (Three.js / React Three Fiber) and a typographic intro loader.
- **Smooth scrolling** powered by Lenis, with GSAP/Motion-driven scroll reveals.
- **Dynamic sections** — Hero Banner, Journey, Experience, Skills, Case Studies, CTA, Contact, Footer — all rendered from the database.
- **Case Studies** filter by a `featured` flag managed in the admin.
- **Contact form** that stores messages (with subject, type, and read state) into the database.
- **Public blog** — Markdown articles rendered with `react-markdown` + `remark-gfm` + `rehype-highlight` (GitHub-dark code theme) and syntax highlighting.
- **Dark/light theme** via `next-themes`.
- SEO-friendly, fully responsive, with a custom cursor and magnetic-button micro-interactions.

### Admin CMS (`/admin/dashboard`)
- Secure **email/password auth** (Better-Auth) with an admin-only role gate.
- Tabbed dashboard for managing: **Hero Banner, About, Experience, Projects, Skills, Blog Posts, Site Settings, Inbox Messages**.
- **Cloudinary image uploads** with drag-and-drop, live preview, and progress in Projects, Blogs, and About.
- **Featured toggle** on projects to control homepage case studies.
- **Inbox** for contact messages with read/unread tracking.
- Full **CRUD** for all content types, backed by a Zustand store hydrated from server data.

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
| Media | Cloudinary (server-side uploads) |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
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
│   │   ├── blog/              # /blogs + /blogs/[slug] (Markdown reader, own navbar/layout)
│   │   ├── admin/             # /admin/login + /admin/dashboard
│   │   └── api/
│   │       ├── auth/[...auth] # Better-Auth handler
│   │       ├── contact/       # Public contact form submissions
│   │       └── admin/         # CRUD routes (banner, about, experiences,
│   │                          #   projects, skills, blogs, settings,
│   │                          #   messages, upload)
│   ├── components/
│   │   ├── home/              # Public site sections
│   │   ├── hero/              # Hero + WebGL shaders
│   │   ├── admin/             # Dashboard tabs & layout
│   │   ├── shared/            # Navbar, Footer
│   │   └── ui/                # shadcn primitives
│   ├── lib/                   # prisma, auth, cloudinary, api-client, utils
│   ├── store/                 # Zustand portfolio store
│   └── data/                  # Frontend type definitions (legacy mappings)
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

# Cloudinary (image uploads) — optional to run, required to upload
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
- Wired into **Projects** (cover), **Blog posts** (cover image), and **About** (avatar).

---

## The Admin CMS

- **Route:** `/admin/dashboard` (redirects to `/admin/login` when unauthenticated).
- Server component fetches initial data from Prisma and hydrates a Zustand store on the client; subsequent edits hit the REST API and update the store optimistically.
- Every mutation route calls `revalidatePath("/")` (and `/blogs` for posts) so the public site refreshes immediately — important for ISR/Vercel caching.
- Tabs: **Hero Banner · About · Experience · Projects · Skills · Blog Posts · Site Settings · Inbox Messages**.

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
- The public homepage and dashboard are server-rendered dynamically (`revalidate = 0`) so content is always fresh.

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
- **Blog content** is authored in Markdown in the Blog Posts tab and rendered with GitHub-flavored Markdown + syntax highlighting.

---

© Mobarak Hossain Razu — [mhrazu.com](https://mhrazu.com)
