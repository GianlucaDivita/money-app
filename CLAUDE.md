# CLAUDE.md — BudgetLens: Personal Budget Tracker

> **Project Codename:** BudgetLens
> **Type:** Single-Page Application (SPA) — Personal Finance Tracker
> **Stack:** React 18 + TypeScript + Tailwind CSS + Recharts + LocalStorage/IndexedDB
> **Design System:** Glassmorphism with Light/Dark Theme Toggle
> **Philosophy:** Sophisticated, lightweight, privacy-first (all data stays on-device)

---

## 🧭 PROJECT OVERVIEW

BudgetLens is a personal budget tracker that lets users manually input income and expenses, categorize transactions, and visualize their financial health through interactive charts and graphs. It is **entirely client-side** — no backend, no accounts, no servers. Data persists in the browser via IndexedDB. The app prioritizes beautiful glassmorphism aesthetics, buttery animations, and genuinely useful financial insight features that go beyond basic tracking.

### Core Value Proposition
- **Manual-first:** Users are intentional about every transaction they log — this builds financial awareness
- **Visual-first:** Every screen communicates financial health at a glance through charts, color-coding, and progress indicators
- **Private-first:** Zero data leaves the device. No sign-up. No cloud. Full ownership.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
src/
├── main.tsx                          # App entry point
├── App.tsx                           # Root component, theme provider, router
├── index.css                         # Global styles, CSS variables, glassmorphism utilities
│
├── context/
│   ├── ThemeContext.tsx               # Light/dark theme state + toggle logic
│   ├── BudgetContext.tsx              # Global state: transactions, categories, budgets
│   └── CurrencyContext.tsx           # Currency formatting and locale settings
│
├── hooks/
│   ├── useTransactions.ts            # CRUD operations for transactions
│   ├── useBudgets.ts                 # Budget limit logic and calculations
│   ├── useAnalytics.ts              # Derived stats: totals, averages, trends
│   ├── useStorage.ts                 # IndexedDB read/write abstraction
│   ├── useTheme.ts                   # Theme toggle hook
│   └── useExport.ts                  # CSV/JSON export logic
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx              # Main layout wrapper (sidebar + content area)
│   │   ├── Sidebar.tsx               # Navigation sidebar with glassmorphism styling
│   │   ├── TopBar.tsx                # Header with search, theme toggle, quick-add button
│   │   └── MobileNav.tsx             # Bottom navigation bar for mobile viewports
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx         # Main dashboard — overview of financial health
│   │   ├── BalanceCard.tsx           # Large hero card showing net balance
│   │   ├── SpendingPieChart.tsx      # Pie/donut chart of spending by category
│   │   ├── IncomeVsExpenseBar.tsx    # Bar chart comparing income vs expenses over time
│   │   ├── TrendLineChart.tsx        # Line chart showing spending trends over weeks/months
│   │   ├── BudgetProgressRings.tsx   # Circular progress rings for each budget category
│   │   ├── RecentTransactions.tsx    # Latest 5-10 transactions with quick actions
│   │   └── SavingsGoalTracker.tsx    # Visual progress toward savings goals
│   │
│   ├── transactions/
│   │   ├── TransactionsPage.tsx      # Full transaction list with filters and search
│   │   ├── TransactionForm.tsx       # Add/edit transaction modal or drawer
│   │   ├── TransactionRow.tsx        # Single transaction display row
│   │   ├── TransactionFilters.tsx    # Filter bar: date range, category, type, amount range
│   │   └── BulkActions.tsx           # Multi-select and bulk delete/categorize
│   │
│   ├── budgets/
│   │   ├── BudgetsPage.tsx           # Budget management — set limits per category
│   │   ├── BudgetCard.tsx            # Individual budget card with progress bar
│   │   └── BudgetForm.tsx            # Create/edit budget limit modal
│   │
│   ├── analytics/
│   │   ├── AnalyticsPage.tsx         # Deep-dive analytics and insights
│   │   ├── CategoryBreakdown.tsx     # Detailed category-level analysis
│   │   ├── MonthlyComparison.tsx     # Month-over-month spending comparison
│   │   ├── SpendingHeatmap.tsx       # Calendar heatmap of daily spending intensity
│   │   ├── TopMerchants.tsx          # Most frequent/expensive merchants/payees
│   │   └── InsightCards.tsx          # AI-free smart insights (pattern detection)
│   │
│   ├── goals/
│   │   ├── GoalsPage.tsx             # Savings goals management
│   │   ├── GoalCard.tsx              # Individual goal with visual progress
│   │   └── GoalForm.tsx              # Create/edit savings goal
│   │
│   ├── settings/
│   │   ├── SettingsPage.tsx          # App preferences
│   │   ├── CategoryManager.tsx       # Custom category CRUD with icon/color picker
│   │   ├── DataManagement.tsx        # Export, import, reset data
│   │   └── CurrencySelector.tsx      # Currency and locale preferences
│   │
│   └── shared/
│       ├── GlassCard.tsx             # Reusable glassmorphism card component
│       ├── GlassModal.tsx            # Modal with glass effect and backdrop blur
│       ├── GlassButton.tsx           # Styled button variants (primary, secondary, ghost, danger)
│       ├── GlassInput.tsx            # Styled input/select with glass aesthetic
│       ├── EmptyState.tsx            # Illustrated empty states for each section
│       ├── AnimatedNumber.tsx        # Smooth number counting animation for totals
│       ├── CurrencyDisplay.tsx       # Formatted currency with locale support
│       ├── CategoryIcon.tsx          # Icon + color badge for categories
│       ├── ConfirmDialog.tsx         # Confirmation dialog for destructive actions
│       └── Toast.tsx                 # Toast notification system
│
├── lib/
│   ├── db.ts                         # IndexedDB setup (using idb library)
│   ├── categories.ts                 # Default category definitions with icons and colors
│   ├── calculations.ts              # Financial math: totals, averages, percentage changes
│   ├── dateUtils.ts                  # Date formatting, range generation, period grouping
│   ├── exportUtils.ts               # CSV and JSON export generators
│   ├── importUtils.ts               # CSV and JSON import parsers with validation
│   ├── insights.ts                   # Pattern detection engine for smart insights
│   └── constants.ts                  # App-wide constants, default settings
│
├── types/
│   └── index.ts                      # All TypeScript interfaces and types
│
└── assets/
    └── icons/                        # Custom SVG category icons if needed
```

---

## 🎨 DESIGN SYSTEM — GLASSMORPHISM SPECIFICATION

### Design Philosophy
The entire UI is built on **glassmorphism** — translucent layers with blur, subtle borders, and depth. The aesthetic should feel like looking through frosted crystal panels floating above a soft gradient background. Every card, modal, sidebar, and input should feel like a physical glass object with weight, depth, and light interaction.

### CSS Variables — Define These in `index.css`

```css
:root {
  /* ===== LIGHT THEME ===== */
  --bg-gradient-start: #e8f0fe;
  --bg-gradient-mid: #f5e6ff;
  --bg-gradient-end: #ffe8ec;
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-border: rgba(255, 255, 255, 0.6);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);
  --glass-blur: 16px;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-muted: #8888aa;
  --accent-income: #10b981;        /* Emerald green */
  --accent-expense: #f43f5e;       /* Rose red */
  --accent-primary: #6366f1;       /* Indigo */
  --accent-warning: #f59e0b;       /* Amber */
  --surface-hover: rgba(255, 255, 255, 0.6);
  --divider: rgba(255, 255, 255, 0.3);
}

[data-theme="dark"] {
  /* ===== DARK THEME ===== */
  --bg-gradient-start: #0f0f1a;
  --bg-gradient-mid: #1a0f2e;
  --bg-gradient-end: #1a0f1f;
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-blur: 20px;
  --text-primary: #f0f0f5;
  --text-secondary: #b0b0cc;
  --text-muted: #6a6a88;
  --accent-income: #34d399;
  --accent-expense: #fb7185;
  --accent-primary: #818cf8;
  --accent-warning: #fbbf24;
  --surface-hover: rgba(255, 255, 255, 0.1);
  --divider: rgba(255, 255, 255, 0.08);
}
```

### Glassmorphism Utility Class (Apply to Every Card/Panel)

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}
```

### Background Treatment
The `<body>` or root container should have a **mesh gradient background** that is fixed and does NOT scroll. Use a multi-stop radial or conic gradient that shifts subtly between the three `--bg-gradient-*` colors. Optionally add 2-3 large, soft, blurred decorative gradient orbs (absolutely positioned, 300-500px diameter, ~20% opacity) that float behind content to add organic depth.

### Typography
- **Display / Headings:** Use `"Outfit"` from Google Fonts — geometric, modern, excellent weight range
- **Body / UI Text:** Use `"DM Sans"` from Google Fonts — clean, readable, pairs beautifully with Outfit
- **Monospace / Numbers:** Use `"JetBrains Mono"` for financial figures — currency amounts should feel precise and technical
- Import all three via Google Fonts CDN link in `index.html`

### Spacing & Sizing
- Border radius on glass cards: `16px` (large cards), `12px` (small cards/inputs), `999px` (pills/badges)
- Padding inside glass cards: `24px` standard, `16px` compact
- Gap between cards in grid: `20px`
- Sidebar width: `260px` desktop, collapses to icons on tablet, hidden on mobile (bottom nav replaces it)

### Animation Guidelines
- **Page transitions:** Fade + slight upward slide (200ms ease-out)
- **Card entrance:** Staggered fade-in with `animation-delay` increments of 50ms
- **Number changes:** Use `AnimatedNumber` component — counts up/down smoothly over 400ms
- **Theme toggle:** Smooth 300ms transition on all color and background properties
- **Hover states:** Glass cards lift slightly (translateY -2px) and increase border opacity on hover
- **Charts:** Recharts animations enabled — pie chart segments grow in, line charts draw themselves
- **Modals:** Backdrop fades in, modal scales from 0.95 → 1.0 with opacity

### Iconography
Use **Lucide React** icons throughout. Every category gets a Lucide icon + a color. Map in `lib/categories.ts`.

---

## 📊 DATA MODEL

### TypeScript Interfaces — Define in `types/index.ts`

```typescript
// === Core Entities ===

interface Transaction {
  id: string;                    // UUID v4
  type: 'income' | 'expense';
  amount: number;                // Always positive, type determines sign
  categoryId: string;            // References Category.id
  description: string;           // e.g., "Grocery run at Trader Joe's"
  merchant?: string;             // Optional merchant/payee name
  date: string;                  // ISO 8601 date string (YYYY-MM-DD)
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
  tags?: string[];               // Optional user-defined tags
  isRecurring?: boolean;         // Flag for recurring transactions
  recurringId?: string;          // Links to RecurringRule if applicable
  notes?: string;                // Optional longer notes
}

interface Category {
  id: string;
  name: string;                  // e.g., "Groceries", "Salary", "Entertainment"
  type: 'income' | 'expense' | 'both';
  icon: string;                  // Lucide icon name (e.g., "shopping-cart")
  color: string;                 // Hex color for charts and badges
  isDefault: boolean;            // System default vs user-created
  sortOrder: number;             // Display ordering
}

interface Budget {
  id: string;
  categoryId: string;            // Which category this budget applies to
  amount: number;                // Monthly spending limit
  period: 'weekly' | 'monthly';  // Budget reset period
  createdAt: string;
  isActive: boolean;
}

interface SavingsGoal {
  id: string;
  name: string;                  // e.g., "Emergency Fund", "Vacation"
  targetAmount: number;
  currentAmount: number;         // Manually updated or auto-calculated
  deadline?: string;             // Optional target date
  icon: string;                  // Lucide icon name
  color: string;                 // Accent color for the goal
  createdAt: string;
}

interface RecurringRule {
  id: string;
  transactionTemplate: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'date'>;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastGeneratedDate?: string;    // Track last auto-generated date
  isActive: boolean;
}

interface UserSettings {
  currency: string;              // ISO 4217 code (e.g., "USD", "EUR", "GBP")
  locale: string;                // e.g., "en-US"
  theme: 'light' | 'dark' | 'system';
  startOfWeek: 0 | 1;           // 0 = Sunday, 1 = Monday
  defaultView: 'dashboard' | 'transactions';
  fiscalMonthStart: number;     // 1-12, for custom fiscal year
}

// === Derived / Computed Types ===

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;            // Of total income or expenses
  trend: number;                 // % change from previous period
  averageTransaction: number;
}

interface PeriodSummary {
  period: string;                // "2025-01", "2025-W03", etc.
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;           // netSavings / totalIncome as percentage
  topCategory: string;
  transactionCount: number;
}

interface Insight {
  id: string;
  type: 'warning' | 'achievement' | 'trend' | 'tip';
  title: string;
  description: string;
  icon: string;
  relatedCategoryId?: string;
  priority: number;              // For sorting display order
}
```

---

## 🌟 UNIQUE & USEFUL FEATURES

Build these features — they differentiate BudgetLens from generic trackers:

### 1. 🔥 Spending Streak & Savings Streak
Track consecutive days where the user stays under their daily average spend. Display as a flame icon with a counter. Similarly, track "no-spend days" as a streak. Gamifies budgeting without being cheesy. Show on the dashboard as a small but prominent badge.

### 2. 📅 Spending Heatmap (Calendar View)
A GitHub-contribution-style heatmap but for spending. Each day is a cell colored by spending intensity (green = low/no-spend, yellow = moderate, red = high). Gives an instant visual of spending patterns over months. Build in `SpendingHeatmap.tsx`.

### 3. 🧠 Smart Insights Engine (No AI Required)
Pattern detection in `lib/insights.ts` that generates insights like:
- "You spent 34% more on Dining Out this month compared to your 3-month average"
- "Your grocery spending peaks on Saturdays — consider meal prepping on Fridays"
- "You've saved $420 more than last month — great progress!"
- "Warning: You're on track to exceed your Entertainment budget by the 22nd"
Rules-based, using simple math on transaction data. Display as dismissable `InsightCard` components on the dashboard.

### 4. 💸 Recurring Transaction Templates
Users can define recurring transactions (rent, subscriptions, salary) with a frequency. The app auto-suggests adding them when the date arrives (shown as a gentle banner: "Did your $1,500 rent go through today?"). Users confirm with one tap. Prevents forgetting regular entries.

### 5. 🏷️ Custom Tags System
Beyond categories, allow free-form tags on transactions (e.g., "vacation", "tax-deductible", "impulse-buy"). Tags are searchable and filterable. The analytics page can break down spending by tag, giving cross-category insights like "How much did my vacation really cost?"

### 6. 📊 Savings Rate Spotlight
Prominently display savings rate (% of income saved) on the dashboard as a large, animated gauge or ring. This single number is one of the most important personal finance metrics. Color-code it: red < 10%, yellow 10-20%, green > 20%. Show trend arrow compared to last month.

### 7. 🔄 Month-over-Month Comparison View
Side-by-side comparison of any two months. Show category-level differences with delta amounts and percentages. Helps users answer "Am I doing better or worse than last month?" at a granular level.

### 8. 📤 Data Portability (Export/Import)
- Export all data as CSV or JSON with one click
- Import from CSV (with column mapping UI for flexibility)
- This ensures users are never locked in and can migrate to/from other tools

### 9. 🎯 Budget Pacing Indicator
For each active budget, don't just show "spent vs limit" — show **pacing**. If it's the 15th of the month and they've spent 70% of their grocery budget, show a warning that they're ahead of pace. Formula: `(amountSpent / budgetLimit) vs (dayOfMonth / daysInMonth)`. Visualize as a dual-track progress bar.

### 10. ⌨️ Quick-Add Command Bar
A keyboard-shortcut activated command bar (Cmd/Ctrl + K) that lets power users type transactions in natural shorthand: `"$45 groceries Trader Joe's"` → parsed into amount, category, and merchant. Show a floating glass input at the top of the screen. Parse with simple regex/pattern matching.

---

## 🗺️ IMPLEMENTATION ROADMAP

### Phase 0 — Foundation (Build First)
**Goal:** Project scaffolding, design system, data layer, and theme infrastructure.

| Task | Details | Complexity |
|---|---|---|
| **0.1** Scaffold React + TypeScript + Vite project | `npm create vite@latest budgetlens -- --template react-ts`. Install Tailwind CSS v3, postcss, autoprefixer. Configure `tailwind.config.ts`. | Low |
| **0.2** Install dependencies | `npm install recharts lucide-react idb uuid date-fns`. Dev deps: `@types/uuid`. | Low |
| **0.3** Set up global CSS and design tokens | Create `index.css` with all CSS variables from the Design System section above. Import Google Fonts (Outfit, DM Sans, JetBrains Mono). Define `.glass` utility class and all glassmorphism helpers. Set up the mesh gradient background on body. | Medium |
| **0.4** Implement ThemeContext | Create `context/ThemeContext.tsx`. Store theme in localStorage. Apply `data-theme` attribute to `<html>`. Support 'light', 'dark', and 'system' (uses `prefers-color-scheme`). Transition all colors smoothly on toggle. | Medium |
| **0.5** Set up IndexedDB with `idb` | Create `lib/db.ts`. Define object stores: `transactions`, `categories`, `budgets`, `savingsGoals`, `recurringRules`, `settings`. Write typed CRUD helper functions. Seed default categories on first launch. | Medium |
| **0.6** Define all TypeScript types | Create `types/index.ts` with every interface from the Data Model section. | Low |
| **0.7** Create default categories | Create `lib/categories.ts` with 12-15 default categories for expenses (Groceries, Dining, Transport, Entertainment, Shopping, Health, Utilities, Housing, Education, Subscriptions, Personal Care, Gifts) and 4-5 for income (Salary, Freelance, Investments, Refunds, Other). Each with a Lucide icon name and hex color. | Low |
| **0.8** Build shared glass components | Build `GlassCard`, `GlassButton`, `GlassInput`, `GlassModal`, `Toast`, `ConfirmDialog`, `AnimatedNumber`, `CurrencyDisplay`, `CategoryIcon`. These are the atomic building blocks — get them pixel-perfect. | High |

**Acceptance Criteria for Phase 0:**
- App runs with Vite dev server
- Theme toggles between light and dark with smooth transitions
- Glassmorphism background and cards render correctly in both themes
- IndexedDB initializes with default categories
- All shared components render correctly in a test page

---

### Phase 1 — MVP Core (Build Second)
**Goal:** Users can add transactions, view them in a list, and see a basic dashboard with charts.

| Task | Details | Complexity |
|---|---|---|
| **1.1** Build AppShell layout | Sidebar (desktop), bottom nav (mobile), TopBar with theme toggle and quick-add button. Glass styling on sidebar. Responsive breakpoints at 768px and 1024px. | High |
| **1.2** Build TransactionForm | Modal/drawer with fields: type toggle (income/expense), amount input, category selector (dropdown with icons), description, merchant (optional), date picker (defaults to today), tags input. All inputs use GlassInput. Validate before save. Write to IndexedDB on submit. | High |
| **1.3** Build TransactionsPage | Full list of transactions, sorted by date (newest first). Each row shows: category icon, description, merchant, formatted amount (green for income, red for expense), date. Implement search by description/merchant. Basic filters: date range (this week/month/year/custom), category, type. | High |
| **1.4** Build DashboardPage — Balance Card | Large hero card at top showing: total income, total expenses, and net balance for the current month. Use AnimatedNumber for smooth counting. Color-code net balance (green positive, red negative). | Medium |
| **1.5** Build DashboardPage — Spending Pie Chart | Recharts PieChart showing expense breakdown by category for current month. Use category colors. Show percentage labels. Glassmorphism card wrapper. Clicking a segment could filter transactions. | Medium |
| **1.6** Build DashboardPage — Income vs Expense Bar Chart | Recharts BarChart showing income vs expenses for last 6 months. Grouped bars (green income, red expenses). Glass card wrapper. | Medium |
| **1.7** Build DashboardPage — Recent Transactions | Show the 5 most recent transactions with quick-action buttons (edit, delete). Reuse TransactionRow component. | Low |
| **1.8** Build DashboardPage — Trend Line Chart | Line chart showing daily or weekly spending totals over the last 30 days. Smooth curve. Area fill with gradient. | Medium |
| **1.9** Transaction Edit & Delete | Edit reopens TransactionForm with pre-filled data. Delete shows ConfirmDialog. Both update IndexedDB and refresh UI state. | Medium |

**Acceptance Criteria for Phase 1:**
- User can add, edit, delete income and expense transactions
- Dashboard shows real-time balance, pie chart, bar chart, trend line, and recent transactions
- All charts animate on load and update when data changes
- Search and filters work on the transactions page
- Fully responsive — works on mobile, tablet, and desktop

---

### Phase 2 — Enhancement (Build Third)
**Goal:** Budgets, savings goals, analytics deep-dive, and unique features.

| Task | Details | Complexity |
|---|---|---|
| **2.1** Build BudgetsPage | CRUD for budget limits per category. Budget cards showing spent vs limit with a progress bar. Pacing indicator (on-track / ahead / behind). Color transitions as budget approaches limit. | High |
| **2.2** Build BudgetProgressRings on Dashboard | Small circular progress rings for each active budget. Shown in a horizontal scrollable row or grid. Ring color shifts from green → yellow → red as it fills. | Medium |
| **2.3** Build GoalsPage | CRUD for savings goals. Goal cards with visual progress bar, target amount, current amount, deadline, and "days remaining" countdown. Allow manual updates to currentAmount. | Medium |
| **2.4** Build SavingsGoalTracker on Dashboard | Compact goal progress indicators on the dashboard for the top 2-3 active goals. | Low |
| **2.5** Build AnalyticsPage — Category Breakdown | Detailed per-category analysis: total, average transaction, count, trend vs previous period. Sortable table with mini bar charts. | High |
| **2.6** Build AnalyticsPage — Spending Heatmap | Calendar-style heatmap (like GitHub contributions) showing spending intensity per day. Use a custom SVG or div grid. Color scale from the category palette. Tooltip on hover shows day total. | High |
| **2.7** Build AnalyticsPage — Monthly Comparison | Side-by-side comparison of two selected months. Table showing each category with amounts and delta (↑↓). Summary row with totals. | Medium |
| **2.8** Build Smart Insights Engine | Implement `lib/insights.ts`. Rules: budget pacing warnings, spending anomalies (>30% above average), savings streaks, top spending category alerts, savings rate changes. Generate Insight objects and display as InsightCards on the dashboard. | High |
| **2.9** Build Savings Rate Spotlight | Large animated gauge/ring on dashboard showing savings rate %. Color-coded with thresholds. Trend arrow vs last month. | Medium |
| **2.10** Build Spending & Savings Streaks | Track consecutive days under daily average spend and no-spend day streaks. Display as badges on dashboard. Store streak data in settings or compute on-the-fly. | Medium |

**Acceptance Criteria for Phase 2:**
- Users can set and track budgets with pacing indicators
- Savings goals with progress tracking are functional
- Analytics page provides deep insights: heatmap, comparisons, breakdowns
- Smart insights generate contextual, useful suggestions
- Streaks and savings rate add engagement without feeling gimmicky

---

### Phase 3 — Polish & Power Features (Build Last)
**Goal:** Power-user features, data portability, recurring transactions, and final polish.

| Task | Details | Complexity |
|---|---|---|
| **3.1** Build Quick-Add Command Bar | Cmd/Ctrl+K opens a floating glass input. Parse input like "$45 groceries TJ's" using regex. Auto-suggest categories. Submit adds transaction instantly. | High |
| **3.2** Build Recurring Transactions | RecurringRule CRUD. On app load, check if any recurring transactions are due. Show a banner/notification: "Rent ($1,500) was due yesterday — add it?" One-click confirm. Settings page to manage rules. | High |
| **3.3** Build Custom Tags System | Free-form tag input on TransactionForm (comma-separated or chip-style input). Tags filter on TransactionsPage. Analytics breakdown by tag. | Medium |
| **3.4** Build Data Export | Export all transactions as CSV (with headers: date, type, category, amount, description, merchant, tags). Also offer JSON export of full database. Button in SettingsPage. | Medium |
| **3.5** Build Data Import | Import from CSV. Show a column-mapping step (which CSV column maps to which field). Preview first 5 rows before confirming. Validate data, show error report. | High |
| **3.6** Build Category Manager in Settings | Custom category CRUD: add new categories with custom name, icon (picker from Lucide set), and color (color picker). Edit/delete existing. Prevent deleting categories that have transactions (or offer reassignment). | Medium |
| **3.7** Build Top Merchants in Analytics | Ranked list of merchants/payees by total spend and frequency. Simple table or card layout. | Low |
| **3.8** Final Animation & Polish Pass | Review every page for: entrance animations, staggered reveals, hover states, loading states (skeleton glass cards), empty states (illustrated messages when no data). Ensure theme transitions are silky smooth. Test all glassmorphism effects in both themes. | High |
| **3.9** Responsive & Accessibility Audit | Test at 320px, 375px, 768px, 1024px, 1440px widths. Ensure tab navigation works. ARIA labels on interactive elements. Color contrast meets WCAG AA on glass surfaces (adjust opacity if needed). | Medium |
| **3.10** Performance Optimization | Lazy-load analytics page and charts (React.lazy + Suspense). Memoize expensive calculations (useMemo). Virtualize long transaction lists if >500 rows (react-window). Audit bundle size. | Medium |

**Acceptance Criteria for Phase 3:**
- Quick-add command bar parses and creates transactions from shorthand
- Recurring transaction system prompts and confirms on schedule
- Tags provide cross-category analytics
- Full CSV/JSON export and CSV import with column mapping
- App feels polished, fast, and delightful in both themes at all screen sizes

---

## 📐 TECHNICAL GUIDELINES

### State Management
- Use **React Context** for global state (theme, transactions, budgets). No Redux needed for this scale.
- Each context provider wraps the app in `App.tsx`.
- Use `useReducer` inside BudgetContext for complex transaction state updates.
- All data reads/writes go through custom hooks (`useTransactions`, `useBudgets`, etc.) which abstract IndexedDB operations.

### IndexedDB via `idb`
- Use the `idb` library for a Promise-based IndexedDB wrapper.
- Create a `lib/db.ts` module that opens the database, defines stores, and exports typed helper functions.
- Database name: `budgetlens-db`, version: `1`.
- Object stores: `transactions` (keyPath: `id`), `categories` (keyPath: `id`), `budgets` (keyPath: `id`), `savingsGoals` (keyPath: `id`), `recurringRules` (keyPath: `id`), `settings` (keyPath: `key`).
- Create indexes on `transactions` for: `date`, `categoryId`, `type`.

### Charting with Recharts
- Use `ResponsiveContainer` wrapper on every chart for fluid sizing.
- Enable `animationBegin` and `animationDuration` props for entrance animations.
- Use custom tooltip components styled with glassmorphism (glass background + blur).
- Chart colors should pull from category colors for consistency.
- Pie chart: use `PieChart` with `Pie` component, `Cell` for per-segment coloring.
- Bar chart: use `BarChart` with `Bar`, grouped for income/expense.
- Line chart: use `LineChart` with `Line` and `Area` fill for gradient effect.

### Routing
- Use **React Router v6** (`react-router-dom`).
- Routes: `/` (Dashboard), `/transactions` (Transactions), `/budgets` (Budgets), `/analytics` (Analytics), `/goals` (Goals), `/settings` (Settings).
- Wrap route transitions in a simple fade animation using CSS transitions or `framer-motion` if added.

### Code Quality
- Strict TypeScript — no `any` types.
- All components are functional with hooks.
- File naming: PascalCase for components (`GlassCard.tsx`), camelCase for utilities (`dateUtils.ts`).
- Keep components focused — if a component exceeds ~150 lines, decompose it.
- Use `date-fns` for all date manipulation (formatting, comparisons, ranges).

### Responsive Strategy
- Mobile-first Tailwind classes.
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Mobile: single column, bottom nav, full-width cards, swipeable interactions.
- Tablet: two-column dashboard grid, collapsed sidebar (icons only).
- Desktop: full sidebar, 3-column dashboard grid, spacious card layout.

---

## 🚦 TASK EXECUTION ORDER FOR CLAUDE CODE

Execute tasks in this exact order. Each task should be completable in a single session. Reference the file structure and interfaces defined above.

```
Phase 0: Foundation
  → 0.1 Scaffold project (Vite + React + TS + Tailwind)
  → 0.2 Install all dependencies
  → 0.3 Global CSS, design tokens, glassmorphism utilities, background
  → 0.4 ThemeContext + theme toggle logic
  → 0.5 IndexedDB setup with idb
  → 0.6 TypeScript types
  → 0.7 Default categories data
  → 0.8 Shared glass components (GlassCard, GlassButton, GlassInput, GlassModal, etc.)

Phase 1: MVP
  → 1.1 AppShell layout (Sidebar, TopBar, MobileNav)
  → 1.2 TransactionForm (add transaction)
  → 1.3 TransactionsPage (list, search, filters)
  → 1.4 DashboardPage — BalanceCard
  → 1.5 DashboardPage — SpendingPieChart
  → 1.6 DashboardPage — IncomeVsExpenseBar
  → 1.7 DashboardPage — RecentTransactions
  → 1.8 DashboardPage — TrendLineChart
  → 1.9 Transaction edit & delete

Phase 2: Enhancement
  → 2.1 BudgetsPage with pacing
  → 2.2 BudgetProgressRings on Dashboard
  → 2.3 GoalsPage
  → 2.4 SavingsGoalTracker on Dashboard
  → 2.5 AnalyticsPage — CategoryBreakdown
  → 2.6 AnalyticsPage — SpendingHeatmap
  → 2.7 AnalyticsPage — MonthlyComparison
  → 2.8 Smart Insights Engine
  → 2.9 Savings Rate Spotlight
  → 2.10 Spending & Savings Streaks

Phase 3: Polish
  → 3.1 Quick-Add Command Bar
  → 3.2 Recurring Transactions
  → 3.3 Custom Tags
  → 3.4 Data Export (CSV/JSON)
  → 3.5 Data Import (CSV with mapping)
  → 3.6 Category Manager in Settings
  → 3.7 Top Merchants analytics
  → 3.8 Animation & polish pass
  → 3.9 Responsive & accessibility audit
  → 3.10 Performance optimization
```

---

## ✅ COMPLETION LOG

### All Original Phases Complete (0-3)
Every task from Phase 0 (Foundation) through Phase 3 (Polish & Power Features) has been implemented.

### Stability Fixes (Feb 2026)
1. **Overscroll white edges** — Added `background-color: var(--bg-gradient-start)` to `html` rule so macOS elastic bounce reveals theme-matching color
2. **useMemo date stability** — `new Date()` outside `useMemo` defeated all memoization. Fixed in 4 files by moving dates inside callbacks or serializing to stable string (`todayStr` pattern). Files: `useAnalytics.ts`, `SpendingHeatmap.tsx`, `BudgetProgressRings.tsx`, `BudgetsPage.tsx`
3. **CSS cascade fix** — Removed unlayered `* { margin: 0; padding: 0 }` that overrode all Tailwind v4 layered utilities
4. **Animation scroll fix** — Changed `animation-fill-mode: both` to `backwards`, then added global `animationend` listener (see Performance Pass below) to fully eliminate scroll-triggered card disappearance
5. **Collapsible sidebar** — SidebarContext + localStorage persistence, 280px expanded / 72px collapsed
6. **Lazy route prefetching** — All 5 routes prefetched via `setTimeout(1s)` after mount, tab switching <90ms
7. **Bundle optimization** — Explicit lucide icon map, manual Rollup chunks, 224KB gzipped total

### Phase 4: 9 New Features (Feb 2026)

**1. Undo/Redo Stack** (`context/UndoContext.tsx`)
- In-memory past/future stacks, capped at 10 actions
- Global keyboard: `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo (excluded in input/textarea)
- Wired into all CRUD pages: TransactionsPage, TransactionForm, BudgetsPage, BudgetForm, GoalsPage, GoalForm, QuickAdd
- Provider nesting: `BudgetProvider > ToastProvider > UndoProvider` (UndoContext consumes both)

**2. Category Trends** (`components/analytics/CategoryTrends.tsx`)
- Recharts AreaChart showing 12 months of spending for a selected category
- Dynamic gradient fill uses the selected category's color
- Dashed ReferenceLine at the 12-month average
- Default: highest-spend expense category

**3. Financial Health Score** (`lib/healthScore.ts`, `components/dashboard/HealthScoreGauge.tsx`)
- 5-component weighted score: Savings Rate (30%), Budget Adherence (25%), Spending Trend (20%), Goal Progress (15%), Consistency (10%)
- SVG 270-degree arc gauge (7 o'clock to 5 o'clock) with color tiers: red <40, amber 40-70, green 70+
- Drop-shadow glow on arc, sub-score progress bars below

**4. Split Transactions** (`components/transactions/SplitEditor.tsx`, `lib/calculations.ts:getEffectiveCategories`)
- `TransactionSplit` type: `{ categoryId, amount, description? }` — optional `splits` array on Transaction
- `getEffectiveCategories(tx)`: centralized helper all consumers use instead of `tx.categoryId` directly
- Updated: `useAnalytics` categoryBreakdown, `calculateBudgetStatus`, `insights.ts` anomaly detection, `exportUtils`
- SplitEditor UI: category + amount rows, running total with balanced/unbalanced indicator
- TransactionRow shows "Split" badge when splits exist

**5. Receipt Photos** (`components/transactions/ReceiptCapture.tsx`, `ReceiptViewer.tsx`)
- Canvas API resize to 800px max dimension, JPEG quality 0.6 (~100-200KB per image)
- Stored as `receiptImage` base64 string on Transaction (optional field)
- ReceiptCapture: file input with `accept="image/*" capture="environment"` for mobile camera
- ReceiptViewer: GlassModal with full-size image display
- Receipt icon in TransactionRow action buttons when attached

**6. Bill Calendar** (`lib/billCalendar.ts`, `components/analytics/BillCalendar.tsx`)
- Reuses exported `getNextDate` from `recurring.ts` to project recurring rule occurrences
- 7-column CSS div grid (Sun-Sat) with month navigation
- Color dots on days with bills, today highlighted with accent ring
- Click day for detail panel with category icons and amounts

**7. Cash Flow Waterfall** (`lib/waterfall.ts`, `components/analytics/WaterfallChart.tsx`)
- Recharts stacked BarChart waterfall: invisible base + visible colored bars
- Income categories (green, going up) → Expense categories (colored, going down) → Net balance
- Split-aware via `getEffectiveCategories`

**8. Year-in-Review** (`lib/yearReview.ts`, `components/analytics/YearInReview.tsx`)
- GlassModal opened from "Year in Review" button in AnalyticsPage header
- Year selector dropdown (current year - 4)
- 4 key metric AnimatedNumber cards, 12 monthly mini-bars (best=green, worst=red)
- Category trends table: H1 vs H2 with trend arrows (>10% threshold)
- Top merchant card

**9. Dashboard Customizer** (`hooks/useDashboardLayout.ts`, `components/dashboard/DashboardCustomizer.tsx`)
- Persists widget visibility/order in IndexedDB settings (key: `dashboard-layout`)
- Merges saved layout with defaults on load (handles new widgets added in future)
- Settings gear icon in dashboard header opens customizer modal
- Eye/EyeOff toggle per widget, ChevronUp/Down reordering, Reset to Default
- Grid layout groups are fixed (hero row, stats row, charts row, bottom row); visibility is toggleable per widget

### Bugs Caught & Workarounds

- **AnimatedNumber lacks `prefix` prop**: YearInReview initially passed `prefix="$"` which doesn't exist on the component. Fix: used `formatFn={n => \`$${n.toLocaleString()}\`}` instead.
- **`getNextDate` was private in recurring.ts**: Bill Calendar needed it to project occurrences. Fix: changed `function` to `export function`.
- **Split validation edge case**: When `isSplit` is true, category select is hidden, so `categoryId` could be empty. Fix: use first split's `categoryId` as the primary `tx.categoryId` for backwards-compatible display.
- **Bundle stayed under target**: 232 KB gzipped initial load after all 9 features (was 224 KB). No new npm dependencies. AnalyticsPage lazy chunk grew to 7.3 KB (was part of analytics) due to 4 new chart components.

### Performance Pass (Feb 2026)

Investigated sluggish dashboard rendering, cards disappearing on scroll, and slow menu transitions. Root causes and fixes:

**1. Context value memoization** (`BudgetContext.tsx`, `UndoContext.tsx`)
- Neither context provider memoized its `value` prop — every parent re-render (sidebar toggle, theme change) created a new context value object, forcing ALL consumers to re-render and re-compute analytics
- Fix: wrapped provider values in `useMemo` with proper dependency arrays
- Impact: sidebar toggle and theme switch no longer trigger dashboard recomputation

**2. String-based date filtering** (`lib/calculations.ts`, `hooks/useAnalytics.ts`, `lib/healthScore.ts`, `lib/insights.ts`)
- Dashboard was calling `parseISO()` + `isWithinInterval()` 10-12 times per render, each iterating all transactions — ~2000 Date object allocations for 200 transactions
- Fix: added `isInRange(dateStr, startStr, endStr)` and `monthRangeStrings(date)` helpers in `calculations.ts` that use pure string comparison (`tx.date >= '2025-01-01'`), ~50x faster
- Rewrote `useAnalytics` to single-pass partition transactions into current/prev month buckets; `monthlyTotals` now uses single loop with bucket assignment instead of 6 separate filter passes
- Applied same pattern to `healthScore.ts` and `insights.ts`

**3. React.memo on dashboard widgets** (8 components)
- BalanceCard, SpendingPieChart, IncomeVsExpenseBar, TrendLineChart, SavingsRateSpotlight, HealthScoreGauge, SpendingStreaks, InsightCards — all wrapped with `React.memo`
- Prevents re-rendering when props haven't changed (e.g., adding a budget doesn't re-render chart widgets)

**4. Deterministic insight IDs** (`lib/insights.ts`)
- `generateInsights` was calling `uuid()` for each insight, creating unstable keys that forced React to unmount/remount InsightCard components on every recomputation
- Fix: replaced with `stableId(prefix)` counter that resets per call — same inputs produce same IDs
- Also removed `uuid` import from insights.ts (small bundle savings)

**5. Animation scroll disappearance fix** (`App.tsx`, `index.css`)
- `animation-fill-mode: backwards` alone was NOT enough — `backdrop-filter: blur()` creates GPU compositing layers, and browsers re-evaluate stale animation state when elements re-enter the viewport after scrolling, causing cards to vanish
- Fix: global `animationend` listener in App.tsx sets `el.style.animation = 'none'` after animation plays, eliminating all stale animation state
- Added `contain: layout style paint` to `.glass` and `.glass-sm` CSS classes — limits compositing scope and reduces GPU memory pressure from `backdrop-filter`

**Bundle size**: ~231.5 KB gzipped (was ~232 KB) — slightly smaller due to `uuid` removal from insights

### Known Non-Issues
- Recharts `-1 width/height` warnings are cosmetic (ResponsiveContainer initialization race)

---

## ⚠️ CRITICAL RULES

1. **Every visual element must use glassmorphism.** Cards, modals, sidebar, inputs, tooltips — all glass. No flat opaque backgrounds on interactive elements.
2. **Both themes must look excellent.** Dark theme is NOT an afterthought. Test every component in both themes. Glass effects behave differently on light vs dark — tune opacity and blur separately.
3. **Numbers are sacred.** All financial figures must be formatted with proper currency symbols, thousands separators, and decimal places via `Intl.NumberFormat`. Use `CurrencyDisplay` component everywhere.
4. **Animations must be purposeful.** Every animation should communicate meaning (data loading, state change, user feedback). No gratuitous motion. Respect `prefers-reduced-motion`.
5. **No data loss.** Every write to IndexedDB should be confirmed. Destructive actions (delete transaction, reset data) require ConfirmDialog with explicit confirmation.
6. **Mobile is a first-class citizen.** Not a scaled-down desktop — a thoughtfully designed mobile experience with touch targets ≥44px, swipe gestures where appropriate, and a bottom navigation bar.
7. **Empty states matter.** When there are no transactions, budgets, or goals, show a beautifully designed empty state with an illustration/icon and a clear CTA to add the first item. Never show a blank page.
8. **Keep the bundle light.** This is a lightweight app. No heavy frameworks beyond what's listed. Lazy-load the analytics page. Total JS bundle should stay under 300KB gzipped.
