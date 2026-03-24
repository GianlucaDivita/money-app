# BudgetLens

**Privacy-first personal budget tracker with a glassmorphism interface.**
No accounts. No servers. Your data stays on your device.

**[Live Demo](https://budgetlens-app.vercel.app)**

---

## Features

- **Manual transaction tracking** — Income and expenses with categories, merchants, tags, and receipt photos
- **Interactive dashboard** — Balance card, spending pie chart, income vs. expense bars, trend lines, and budget progress rings
- **Smart budgets** — Set spending limits per category with real-time pacing indicators (under/on-track/ahead/over)
- **Savings goals** — Track progress toward financial targets with deadlines and visual progress bars
- **Analytics deep-dive** — Spending heatmap, category trends, monthly comparisons, cash flow waterfall, year-in-review
- **Financial health score** — Weighted composite of savings rate, budget adherence, spending trends, and goal progress
- **Split transactions** — Divide a single transaction across multiple categories
- **Recurring templates** — Auto-detect and confirm recurring transactions (rent, subscriptions, salary)
- **Smart insights** — Pattern detection engine surfaces spending anomalies, streaks, and budget warnings
- **Quick-add** — `Cmd/Ctrl + K` to add transactions in natural shorthand: `$45 groceries Trader Joe's`
- **Global search** — Press `/` to search across all transactions instantly
- **Installable PWA** — Works offline, installs like a native app on mobile and desktop
- **Full data portability** — Export/import as CSV or JSON. No lock-in.
- **Dashboard customizer** — Toggle and reorder dashboard widgets to your preference
- **Dark + Light themes** — Glassmorphism UI tuned for both, with smooth transitions

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** with custom glassmorphism design system
- **Recharts** for interactive data visualizations
- **IndexedDB** (via `idb`) for client-side persistence
- **Vite** with Turbopack-speed HMR
- **vite-plugin-pwa** for offline-capable Progressive Web App
- **~232 KB gzipped** initial bundle (lazy-loaded routes, manual Rollup chunks)

## Quick Start

```bash
git clone https://github.com/your-username/money-app.git
cd money-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click "Load Demo Data" to explore.

## Architecture

Client-side SPA with React Context (`useReducer`) for global state and IndexedDB for persistence. All financial calculations happen in `lib/calculations.ts` with string-based date comparisons for performance. Dashboard widgets are wrapped in `React.memo` and routes are lazy-loaded with idle-time prefetching for instant tab switching.

## Author

**Gianluca Di Vita**
- Email: gianlucajdivita@gmail.com
- LinkedIn: [linkedin.com/in/gianlucadivita](https://www.linkedin.com/in/gianlucadivita/)
