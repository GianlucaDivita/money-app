import type { UserSettings, DashboardWidget } from '../types';

export const DB_NAME = 'budgetlens-db';
export const DB_VERSION = 1;

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  locale: 'en-US',
  theme: 'system',
  startOfWeek: 0,
  defaultView: 'dashboard',
  fiscalMonthStart: 1,
};

export const ROUTES = {
  DASHBOARD: '/',
  TRANSACTIONS: '/transactions',
  BUDGETS: '/budgets',
  ANALYTICS: '/analytics',
  GOALS: '/goals',
  SETTINGS: '/settings',
} as const;

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  { id: 'recurring-banner', label: 'Recurring Banner', visible: true, order: 0 },
  { id: 'balance-card', label: 'Balance Card', visible: true, order: 1 },
  { id: 'spending-pie', label: 'Spending Pie Chart', visible: true, order: 2 },
  { id: 'health-score', label: 'Health Score', visible: true, order: 3 },
  { id: 'savings-rate', label: 'Savings Rate', visible: true, order: 4 },
  { id: 'streaks', label: 'Spending Streaks', visible: true, order: 5 },
  { id: 'budget-rings', label: 'Budget Rings', visible: true, order: 6 },
  { id: 'insight-cards', label: 'Smart Insights', visible: true, order: 7 },
  { id: 'income-vs-expense', label: 'Income vs Expense', visible: true, order: 8 },
  { id: 'trend-line', label: 'Spending Trend', visible: true, order: 9 },
  { id: 'recent-transactions', label: 'Recent Transactions', visible: true, order: 10 },
  { id: 'savings-goals', label: 'Savings Goals', visible: true, order: 11 },
];
