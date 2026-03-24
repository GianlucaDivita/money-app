# CLAUDE.md — BudgetLens

> **Stack:** React 19 + TypeScript + Tailwind CSS v4 + Recharts + IndexedDB (via `idb`)
> **Design:** Glassmorphism with Light/Dark Theme Toggle
> **Philosophy:** Manual-first, visual-first, privacy-first (100% client-side, zero backend)
> **Live:** https://budgetlens-app.vercel.app (auto-deploys on push to `main`)
> **Author:** Gianluca Di Vita (gianlucajdivita@gmail.com)

---

## Status

All phases complete (0-4 + Phase 5 audit polish). ~234 KB gzipped bundle. Installable PWA.

**Phase 4 features:** Undo/Redo, Category Trends, Health Score Gauge, Split Transactions, Receipt Photos, Bill Calendar, Cash Flow Waterfall, Year-in-Review, Dashboard Customizer.

**Phase 5 audit (Mar 2026):** Error boundaries + DB error handling, accessibility (focus traps, label associations, ARIA, touch targets), bug fixes (split-aware insights, CSV newlines, health score), form protections (double-submit, input constraints), budget/goals sorting, global search (`/`), keyboard shortcuts overlay (`?`), PWA (offline + installable), README rewrite.

---

## Architecture Decisions

- **Tailwind v4** with `@tailwindcss/vite` plugin — no config files, uses `@import "tailwindcss"` (NOT `@tailwind` directives)
- **CSS variables** for theming (not Tailwind theme) — enables runtime theme switching via `data-theme` attribute on `<html>`
- **BudgetContext** uses `useReducer`; all writes go context → IndexedDB. Provider nesting: `BudgetProvider > ToastProvider > UndoProvider`
- **IndexedDB** via `idb` library — singleton `getDB()` pattern. DB: `budgetlens-db`, stores: transactions, categories, budgets, savingsGoals, recurringRules, settings
- **React.lazy** for TransactionsPage, BudgetsPage, AnalyticsPage, GoalsPage, SettingsPage — prefetched via `setTimeout(1s)` after mount
- **Manual Rollup chunks**: vendor-react, vendor-charts, vendor-utils
- **Collapsible sidebar**: SidebarContext + localStorage (`budgetlens-sidebar-collapsed`)
- **Dashboard customizer**: widget visibility/order persisted in IndexedDB settings (key: `dashboard-layout`)
- **Split transactions**: `getEffectiveCategories(tx)` in `calculations.ts` — all consumers use this instead of `tx.categoryId` directly
- **String-based date filtering**: `isInRange()` / `monthRangeStrings()` in `calculations.ts` use pure string comparison instead of `parseISO()` — ~50x faster
- **Deterministic insight IDs**: `stableId(prefix)` counter in `insights.ts` (not `uuid()`) — prevents React remounts
- **React.memo** on all 8 dashboard widgets to prevent unnecessary re-renders
- **`vercel.json`**: SPA catch-all rewrite (`/(.*) → /index.html`) for client-side routing
- **Error handling**: `DBError` class in `db.ts`, try-catch on all CRUD ops, `ErrorBoundary` wraps route content, forms catch + toast on failure
- **PWA**: `vite-plugin-pwa` (dev dep) with auto-updating service worker, SVG maskable icon, offline-capable
- **Accessibility**: `useId()` for label-input association, focus trap in GlassModal, `aria-describedby` on error messages, 44px mobile touch targets
- **Global search**: `GlobalSearch.tsx` triggered by `/` key, searches transactions by description/merchant
- **Keyboard shortcuts**: `KeyboardShortcuts.tsx` triggered by `?` key, lists all shortcuts

---

## Critical Rules

1. **Glassmorphism everywhere.** Cards, modals, sidebar, inputs, tooltips — all glass. No flat opaque backgrounds.
2. **Both themes must look excellent.** Tune opacity separately for light vs dark.
3. **Numbers are sacred.** All financial figures via `Intl.NumberFormat` / `CurrencyDisplay` component.
4. **No data loss.** Destructive actions require `ConfirmDialog`.
5. **Mobile-first.** Bottom nav on mobile, touch targets >= 44px. Breakpoints: sm(640), md(768), lg(1024), xl(1280).
6. **Empty states always.** Never show a blank page — icon + CTA.
7. **Bundle < 300KB gzipped.** Lazy-load analytics. No heavy deps.
8. **Strict TypeScript.** No `any`. Functional components only.

---

## Gotchas — Read Before Editing

### ZERO blur policy (Safari GPU crash)
Safari fullscreen + `backdrop-filter`/`filter: blur()` = GPU texture memory exhaustion (cards vanish, app freezes permanently). **ALL `backdrop-filter` and `filter: blur/drop-shadow` have been removed from the entire app.** Glass aesthetic uses semi-transparent backgrounds (light 0.82, dark 0.78) + borders + box-shadows instead. Decorative orbs use `radial-gradient()`. SVG gauges use `opacity: 0.9`. Modal backdrops use `bg-black/40` (no blur). **Do not re-add any `backdrop-filter` or `filter: blur()`.**

### `new Date()` defeats useMemo
`const now = new Date()` outside `useMemo` creates a new reference every render. Fix: move inside the useMemo callback, or serialize to stable string: `const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])`.

### Tailwind v4 cascade layers
Unlayered CSS resets (`* { margin: 0; padding: 0 }`) override ALL Tailwind utilities because `@import "tailwindcss"` generates utilities inside `@layer utilities`. **Never add unlayered resets that conflict with Tailwind.** Preflight already handles box-sizing/margin resets.

### Overscroll white edges
`html` needs `background-color: var(--bg-gradient-start)` so macOS elastic scroll bounce matches the theme.

### Context value memoization
Context provider `value` props MUST be wrapped in `useMemo` — otherwise every parent re-render (sidebar toggle, theme change) forces all consumers to re-render.

### lucide-react icons
`import *` bundles ALL 1000+ icons (~150KB). Always use explicit named imports. Icon map in `CategoryIcon.tsx`.

### DB errors and private browsing
All IndexedDB CRUD operations throw `DBError` on failure. BudgetContext re-throws so forms can catch + toast. `checkDBAvailability()` in `db.ts` does a test write on mount — `PrivateBrowsingBanner` in `App.tsx` shows if it fails. ErrorBoundary wraps route content (not the shell).

### Other
- `seedDefaults()` runs only once on mount, not on every `refreshData()`
- `AnimatedNumber` has no `prefix` prop — use `formatFn` instead
- `getNextDate` in `recurring.ts` must stay exported (used by Bill Calendar)
- When `isSplit` is true, use first split's `categoryId` as primary `tx.categoryId`
- `requestIdleCallback` not in Safari — use `setTimeout` fallback
- Recharts `-1 width/height` warnings are cosmetic (ResponsiveContainer init race)
- `animationend` listener removes CSS classes (not inline `animation:none`) for clean DOM
