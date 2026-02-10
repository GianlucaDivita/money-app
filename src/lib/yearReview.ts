import {
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  format,
} from 'date-fns';
import type { Transaction, Category } from '../types';

interface MonthData {
  month: string; // "Jan", "Feb", etc
  income: number;
  expenses: number;
  net: number;
}

interface CategoryTrend {
  categoryId: string;
  categoryName: string;
  color: string;
  h1Total: number;
  h2Total: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

export interface YearInReviewData {
  year: number;
  months: MonthData[];
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
  avgMonthlySavings: number;
  bestMonth: MonthData | null;
  worstMonth: MonthData | null;
  categoryTrends: CategoryTrend[];
  topMerchant: { name: string; total: number } | null;
}

export function generateYearInReview(
  transactions: Transaction[],
  categories: Category[],
  year: number
): YearInReviewData {
  const catMap = new Map(categories.map(c => [c.id, c]));

  const months: MonthData[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    const start = startOfMonth(d);
    const end = endOfMonth(d);

    const monthTxs = transactions.filter(tx =>
      isWithinInterval(parseISO(tx.date), { start, end })
    );

    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      month: format(d, 'MMM'),
      income,
      expenses,
      net: income - expenses,
    };
  });

  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const monthsWithData = months.filter(m => m.income > 0 || m.expenses > 0);
  const avgMonthlySavings = monthsWithData.length > 0 ? totalNet / monthsWithData.length : 0;

  // Best/worst by net
  let bestMonth: MonthData | null = null;
  let worstMonth: MonthData | null = null;
  for (const m of monthsWithData) {
    if (!bestMonth || m.net > bestMonth.net) bestMonth = m;
    if (!worstMonth || m.net < worstMonth.net) worstMonth = m;
  }

  // Category trends: H1 vs H2
  const h1Start = new Date(year, 0, 1);
  const h1End = new Date(year, 5, 30);
  const h2Start = new Date(year, 6, 1);
  const h2End = new Date(year, 11, 31);

  const h1Txs = transactions.filter(tx => {
    const d = parseISO(tx.date);
    return d >= h1Start && d <= h1End && tx.type === 'expense';
  });
  const h2Txs = transactions.filter(tx => {
    const d = parseISO(tx.date);
    return d >= h2Start && d <= h2End && tx.type === 'expense';
  });

  const h1ByCat = new Map<string, number>();
  h1Txs.forEach(tx => h1ByCat.set(tx.categoryId, (h1ByCat.get(tx.categoryId) || 0) + tx.amount));

  const h2ByCat = new Map<string, number>();
  h2Txs.forEach(tx => h2ByCat.set(tx.categoryId, (h2ByCat.get(tx.categoryId) || 0) + tx.amount));

  const allCatIds = new Set([...h1ByCat.keys(), ...h2ByCat.keys()]);
  const categoryTrends: CategoryTrend[] = Array.from(allCatIds).map(catId => {
    const cat = catMap.get(catId);
    const h1 = h1ByCat.get(catId) || 0;
    const h2 = h2ByCat.get(catId) || 0;
    const pctChange = h1 > 0 ? ((h2 - h1) / h1) * 100 : (h2 > 0 ? 100 : 0);
    const trend: CategoryTrend['trend'] = Math.abs(pctChange) < 10 ? 'stable' : pctChange > 0 ? 'up' : 'down';

    return {
      categoryId: catId,
      categoryName: cat?.name || 'Unknown',
      color: cat?.color || '#888',
      h1Total: h1,
      h2Total: h2,
      trend,
      percentChange: pctChange,
    };
  }).sort((a, b) => (b.h1Total + b.h2Total) - (a.h1Total + a.h2Total));

  // Top merchant
  const merchantTotals = new Map<string, number>();
  transactions
    .filter(tx => tx.date.startsWith(String(year)) && tx.type === 'expense' && tx.merchant)
    .forEach(tx => {
      merchantTotals.set(tx.merchant!, (merchantTotals.get(tx.merchant!) || 0) + tx.amount);
    });

  let topMerchant: { name: string; total: number } | null = null;
  for (const [name, total] of merchantTotals) {
    if (!topMerchant || total > topMerchant.total) topMerchant = { name, total };
  }

  return {
    year,
    months,
    totalIncome,
    totalExpenses,
    totalNet,
    avgMonthlySavings,
    bestMonth,
    worstMonth,
    categoryTrends,
    topMerchant,
  };
}
