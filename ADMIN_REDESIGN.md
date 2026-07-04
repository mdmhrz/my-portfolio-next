# Admin UI Redesign — Design System Unification

> Living checklist for the `/admin` redesign. This mirrors the approved plan and is
> updated as phases land. Nothing here changes the public site, APIs, or data model.

## Goal

One coherent, industry-grade design system across `src/app/admin/**` — consistent
spacing, radius, typography, surfaces, states, and components — while staying **100%
compatible with the runtime-dynamic color & font system** driven from the Appearance tab.

### Locked decisions
- **Visual identity:** Refined monochrome + a small formal semantic set (success / warning / destructive / info).
- **Type character:** Calm modern SaaS — sentence-case nav; UPPERCASE only for tiny eyebrow labels.
- **Scope:** Admin chrome + all standard pages + login. Blog Editor is a follow-up (Phase 6).

---

## HARD CONSTRAINT — colors & fonts stay fully dynamic

The Appearance tab injects CSS variables scoped to `[data-appearance="admin"]`, overriding
`background, foreground, card, popover, primary, secondary, muted, accent, border, input,
ring`. `--font-app` drives typography globally. Every change MUST:

1. Use **token utility classes only** (`bg-card`, `text-muted-foreground`, `border-border`,
   `bg-primary`, `ring-ring`, …). **No** hardcoded hex/oklch, **no** fixed palette classes
   (`red-500`, `amber-600`, `green-500`, `zinc-600`), **no** hardcoded `font-family`.
2. Treat **card ≈ background** under custom palettes → separate surfaces with
   `border-border` + `shadow-sm dark:shadow-none`, not by fill contrast.
3. Add semantic status tokens (success/warning/info) as **fixed, theme-aware** tokens
   (functional; not part of the user's 6 controllable colors).
4. Verify under **both** the default theme **and** a custom admin palette, in light + dark.

---

## Design system spec

**Radius:** cards/modals → `rounded-xl`; inputs/buttons/table/nav → `rounded-lg`;
pills/badges/avatars → `rounded-full`. No `rounded-2xl` in admin.

**Spacing:** page wrapper `space-y-6`; layout padding `p-6 md:p-8`; single-column pages
`max-w-3xl`, tables/grids full width; stat grids `gap-4`, content grids `gap-6`; card body
`p-6`, compact cards `p-4`.

**Typography (token-colored):**
- Page title: `text-2xl font-semibold tracking-tight`; description `text-sm text-muted-foreground`.
- Card/section title: `text-base font-semibold`.
- Eyebrow (only uppercase style): `text-xs font-medium uppercase tracking-wide text-muted-foreground`.
- Body `text-sm`; caption `text-xs text-muted-foreground`.
- Nav: sentence case, `text-sm font-medium`.
- No no-op `font-sans`; `font-mono` only for code-like strings.

**Surfaces:** one card system (shadcn `<Card>`), always border + `shadow-sm dark:shadow-none`.

**Semantic color:** route featured/status/read indicators through `Badge` variants.

---

## Phases

- [ ] **Phase 0 — Foundation:** this doc + `globals.css` (add success/warning/info tokens,
      remove `!important` dark hex overrides that fight the dynamic injector).
- [ ] **Phase 1 — Primitives:** `EmptyState`, `FormDialog`, `CountBadge`, `Badge` variants,
      `PageHeader` sizing, skeleton alignment.
- [ ] **Phase 2 — Chrome:** sidebar, topbar, nav-items, shell (sentence-case nav, `h-16`
      alignment, token colors, `CountBadge`).
- [ ] **Phase 3 — Pages:** projects, skills, experience, messages, profile, cta, footer,
      nav-links, blogs, settings, appearance, banner.
- [ ] **Phase 4 — Modals & login:** dialogs → `FormDialog`; login gradients → tokens.
- [ ] **Phase 5 — QA:** typecheck/build + Playwright pass (default + custom palette, light/dark).
- [ ] **Phase 6 — Follow-up (not now):** Blog Editor surface.

---

## Verification gate

- `tsc --noEmit` + build clean.
- Playwright pass over representative admin routes in **default** and **custom** palette,
  light + dark — proving no hardcoded color/font broke dynamic theming.
- Grep: no remaining `rounded-2xl`, `red-500/green-500/amber-*/zinc-*`, or no-op `font-sans`
  in `src/app/admin/**`.
