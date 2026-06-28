# Plan — Dedicated Blog Navbar + `/blog` → `/blogs`

Goal: treat the blog as its own "publication" with a dedicated navbar and shared branding, and rename the public route from `/blog` to `/blogs`.

## Architecture decision
Add a **`blogs/layout.tsx`** that renders a new `<BlogNavbar />` + page content + `<Footer />`. Both the listing and the article page inherit it automatically. The homepage `/` stays as-is (`PortfolioHome` already renders its own `Navbar`/`Footer`).

> Why not full route groups `(portfolio)` / `(blog)`? That would require extracting `Navbar`/`Footer` out of `PortfolioHome` into a new portfolio layout — high churn/risk for the same outcome. The lighter `blogs/layout.tsx` achieves the dedicated navbar with minimal disruption. Route groups can be adopted later if the site grows more sections.

---

## 1. Route rename `/blog` → `/blogs`
- **Move** `src/app/blog/` → `src/app/blogs/` (page.tsx + `[slug]/page.tsx`).
- **Update links** (4 spots):
  - `src/components/shared/Navbar.tsx` — Blog href `/blog` → `/blogs`
  - `src/components/shared/Footer.tsx` — Blog href `/blog` → `/blogs`
  - `src/app/blogs/page.tsx` — card link `` `/blog/${slug}` `` → `` `/blogs/${slug}` ``
  - `src/app/blogs/[slug]/page.tsx` — two back-links `href="/blog"` → `href="/blogs"`
- **Redirect** old `/blog` and `/blog/:slug` → `/blogs` / `/blogs/:slug` for SEO & old links (via `next.config.ts` `redirects()`, or a tiny redirect page).
- **README** — update any `/blog` mentions.

## 2. Dedicated blog navbar + layout (NEW)
- **NEW** `src/components/shared/BlogNavbar.tsx`
  - Logo → links to `/` (portfolio home)
  - Nav: **Blogs** (active, `/blogs`), **Portfolio** → `/`
  - Theme toggle (reuse `ThemeToggle`)
  - (Future hooks: Search, Categories — out of v1 scope)
- **NEW** `src/app/blogs/layout.tsx`
  - Renders `<BlogNavbar />` + `<main>{children}</main>` + `<Footer />`
- **Tweak** `src/app/blogs/page.tsx` — remove the standalone "Back to Portfolio" block (the navbar now handles navigation); keep the heading.
- **Tweak** `src/app/blogs/[slug]/page.tsx` — keep "Back to Blogs" link; the article already has date / reading time / author.

## 3. Admin dashboard
- **No structural change required** — the admin Blog tab talks to `/api/admin/blogs` (already plural) and never references the public route.
- **Optional nice-to-have:** add a "View live ↗" link on each blog card in `BlogsTab.tsx` → `/blogs/{slug}` (opens the published article). Confirms slug is clean.

## 4. API layer
- **Routes unchanged** — `/api/admin/blogs`, `/api/admin/blogs/[id]` stay exactly as they are (the `s` was already there).
- **Only fix:** `revalidatePath("/blog")` → `revalidatePath("/blogs")` in 3 spots:
  - `src/app/api/admin/blogs/route.ts` (POST)
  - `src/app/api/admin/blogs/[id]/route.ts` (PUT + DELETE)
- The Zustand store API client already uses `/admin/blogs` (plural) — **no change**.

## 5. Optional "publication" extras (defer unless requested)
- Table of Contents (auto from headings) on article page
- Previous / Next article + Related posts
- Share buttons (X / LinkedIn / copy link)
- Categories + Search on the listing

---

## Files touched
| File | Change |
|---|---|
| `src/app/blog/` → `src/app/blogs/` | rename directory |
| `src/app/blogs/layout.tsx` | **NEW** — BlogNavbar + Footer wrapper |
| `src/components/shared/BlogNavbar.tsx` | **NEW** |
| `src/components/shared/Navbar.tsx` | link `/blog` → `/blogs` |
| `src/components/shared/Footer.tsx` | link `/blog` → `/blogs` |
| `src/app/blogs/page.tsx` | card link → `/blogs/[slug]`; drop standalone back-link |
| `src/app/blogs/[slug]/page.tsx` | back-links → `/blogs` |
| `src/app/api/admin/blogs/route.ts` | `revalidatePath("/blogs")` |
| `src/app/api/admin/blogs/[id]/route.ts` | `revalidatePath("/blogs")` ×2 |
| `next.config.ts` | add `redirects()` `/blog` → `/blogs` |
| `README.md` | route mentions |
| `src/components/admin/BlogsTab.tsx` | (optional) "View live" link |
