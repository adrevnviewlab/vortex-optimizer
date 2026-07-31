# QA Matrix — Cross-Browser & Responsive

> **Design source:** COMPLETION-PLAN §9 (breakpoints + layout behavior)  
> **Sign-off target:** P2 98→100% design milestone  
> **Last updated:** 2026-07-31

This matrix defines manual QA coverage before GA. Automated E2E (`pnpm e2e:smoke`) runs Chromium only in CI; this doc covers cross-browser and responsive sign-off.

---

## Breakpoints (design tokens)

| Token | Width | Name |
|-------|-------|------|
| `--bp-sm` | 640px | Mobile landscape |
| `--bp-md` | 768px | Tablet |
| `--bp-lg` | 1024px | Desktop |
| `--bp-xl` | 1280px | Wide |
| `--bp-2xl` | 1536px | Ultra-wide |

Defined in `packages/ui/tokens.css`.

---

## Browsers

| Browser | Versions | Priority | CI |
|---------|----------|----------|-----|
| Chrome | Latest | P0 | ✅ Playwright smoke |
| Edge | Latest | P0 | Manual |
| Firefox | Latest | P1 | Manual |
| Safari | Latest (macOS + iOS) | P1 | Manual |

---

## Responsive test widths

Run each **key route** at these viewport widths (DevTools device mode or Playwright `page.setViewportSize`):

| Label | Width × Height | Breakpoint |
|-------|----------------|------------|
| Mobile | 390 × 844 | < `--bp-md` |
| Mobile landscape | 667 × 375 | `--bp-sm` |
| Tablet | 820 × 1180 | `--bp-md` – `--bp-lg` |
| Desktop | 1280 × 800 | `--bp-xl` |
| Ultra-wide | 1536 × 960 | `--bp-2xl` |

---

## Key routes (minimum coverage)

| Route | Mobile | Tablet | Desktop | Notes |
|-------|--------|--------|---------|-------|
| `/welcome` | ☐ | ☐ | ☐ | Hero stack vs split; nav hamburger |
| `/pricing` | ☐ | ☐ | ☐ | 3-tier grid → stack on mobile |
| `/login` | ☐ | ☐ | ☐ | Form touch targets ≥44px |
| `/dashboard` | ☐ | ☐ | ☐ | Stat cards 1→2→4 col; charts stack |
| `/clients` | ☐ | ☐ | ☐ | Table horizontal scroll, sticky col |
| `/audits` | ☐ | ☐ | ☐ | DataTable responsive |
| `/audits/[id]` | ☐ | ☐ | ☐ | Tabs + analyze CTA |
| `/settings` | ☐ | ☐ | ☐ | Form layout |
| `/admin` | ☐ | ☐ | ☐ | Invite dialog |

---

## Layout behavior checklist

From design plan §9.2 — verify at each breakpoint:

| Element | <768px (mobile) | 768–1023px (tablet) | ≥1024px (desktop) |
|---------|-----------------|---------------------|-------------------|
| **SideNav** | Hidden; hamburger drawer | Collapsed 64px | Expanded 240px |
| **Header** | Logo in drawer; search/bell/avatar visible | Full header | Full header |
| **FloatingDock** | Bottom safe-area inset | Hover reveal | Hover reveal |
| **Stat cards** | 1 column | 2×2 grid | 4 column row |
| **Chart row** | Stack vertical | Stack vertical | 2 columns |
| **DataTable** | Horizontal scroll; sticky first col | Full table | Full table |
| **SearchCommand (⌘K)** | Full-screen sheet | 480px panel | 480px panel |
| **Marketing hero** | Visual below copy | Side-by-side | 45/55 split |
| **FlipCards** | Tap to flip | Hover flip | Hover flip |

---

## Accessibility (96→98% milestone)

| Check | Tool | Target |
|-------|------|--------|
| Focus order logical | Manual tab | All interactive elements reachable |
| Dialog ARIA | axe / VoiceOver | Title + focus trap |
| Color contrast | axe | ≥4.5:1 body text |
| `prefers-reduced-motion` | OS setting | No spring/rainbow animations |

**Pages for axe pass:** `/welcome`, `/login`, `/dashboard`, `/clients`, `/audits/[id]`.

---

## Motion fallbacks

| Interaction | Reduced motion behavior |
|-------------|-------------------------|
| Button spring | Instant state change |
| Rainbow "+" click | Static highlight |
| Flip cards | Toggle without 3D transform |
| Stat count-up | Show final value immediately |

---

## Sign-off record

| Role | Name | Date | Browsers | Breakpoints | Pass |
|------|------|------|----------|-------------|------|
| Engineering | _pending_ | — | Chrome (CI) | — | 🟡 Partial (CI smoke only) |
| Design/QA | _pending_ | — | All four | All five widths | ☐ User sign-off |

**Repo status:** Automated smoke covers login → dashboard → clients → audits on Chromium. Full cross-browser/responsive sign-off requires manual QA pass using this matrix before declaring **100% GA**.

---

## Quick manual script

```bash
pnpm db:migrate && pnpm db:seed
pnpm dev
# In browser DevTools → toggle device widths above
# Login: admin@vortexoptimizer.com / demo-password
```

Automated alternative (Chromium only, desktop):

```bash
pnpm e2e:smoke
```
