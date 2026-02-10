import { useMemo } from 'react';
import {
  subMonths,
  format,
  addDays,
} from 'date-fns';
import type { Transaction, Category, CategorySummary } from '../types';
import {
  getEffectiveCategories,
  isInRange,
  monthRangeStrings,
  nDaysAgoStr,
} from '../lib/calculations';

interface MonthlyTotals {
  period: string;
  income: number;
  expenses: number;
}

interface DailyTotal {
  date: string;
  total: number;
}

export function useAnalytics(transactions: Transaction[], categories: Category[]) {
  // Stable date strings — string primitives are referentially equal across renders
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const currentRange = useMemo(() => monthRangeStrings(new Date()), []);
  const prevRange = useMemo(() => monthRangeStrings(subMonths(new Date(), 1)), []);

  // Single-pass partition: current month + previous month transactions
  const { currentMonthTxs, prevMonthTxs } = useMemo(() => {
    const cur: Transaction[] = [];
    const prev: Transaction[] = [];
    for (const tx of transactions) {
      if (isInRange(tx.date, currentRange.start, currentRange.end)) cur.push(tx);
      else if (isInRange(tx.date, prevRange.start, prevRange.end)) prev.push(tx);
    }
    return { currentMonthTxs: cur, prevMonthTxs: prev };
  }, [transactions, currentRange, prevRange]);

  // Current month totals — single pass instead of two filter+reduce
  const { currentIncome, currentExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of currentMonthTxs) {
      if (t.type === 'income') income += t.amount;
      else expenses += t.amount;
    }
    return { currentIncome: income, currentExpenses: expenses };
  }, [currentMonthTxs]);

  const netBalance = currentIncome - currentExpenses;

  // Category breakdown for current month expenses (split-aware)
  const categoryBreakdown = useMemo((): CategorySummary[] => {
    let totalExpenses = 0;
    const grouped = new Map<string, { total: number; count: number }>();
    for (const tx of currentMonthTxs) {
      if (tx.type !== 'expense') continue;
      totalExpenses += tx.amount;
      for (const part of getEffectiveCategories(tx)) {
        const prev = grouped.get(part.categoryId) || { total: 0, count: 0 };
        grouped.set(part.categoryId, { total: prev.total + part.amount, count: prev.count + 1 });
      }
    }

    const prevGrouped = new Map<string, number>();
    for (const tx of prevMonthTxs) {
      if (tx.type !== 'expense') continue;
      for (const part of getEffectiveCategories(tx)) {
        prevGrouped.set(part.categoryId, (prevGrouped.get(part.categoryId) || 0) + part.amount);
      }
    }

    return Array.from(grouped.entries())
      .map(([catId, { total, count }]) => {
        const cat = categories.find((c) => c.id === catId);
        const prevTotal = prevGrouped.get(catId) || 0;
        const trend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return {
          categoryId: catId,
          categoryName: cat?.name || 'Unknown',
          total,
          count,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
          trend,
          averageTransaction: count > 0 ? total / count : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [currentMonthTxs, prevMonthTxs, categories]);

  // Last 6 months income vs expenses — string-based filtering
  const monthlyTotals = useMemo((): MonthlyTotals[] => {
    const now = new Date();
    const ranges = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return { label: format(d, 'MMM'), ...monthRangeStrings(d) };
    });

    // Single pass over transactions to bucket into months
    const buckets = new Map<number, { income: number; expenses: number }>();
    for (let i = 0; i < ranges.length; i++) {
      buckets.set(i, { income: 0, expenses: 0 });
    }

    for (const tx of transactions) {
      for (let i = 0; i < ranges.length; i++) {
        if (isInRange(tx.date, ranges[i].start, ranges[i].end)) {
          const b = buckets.get(i)!;
          if (tx.type === 'income') b.income += tx.amount;
          else b.expenses += tx.amount;
          break;
        }
      }
    }

    return ranges.map((r, i) => ({
      period: r.label,
      income: buckets.get(i)!.income,
      expenses: buckets.get(i)!.expenses,
    }));
  }, [transactions]);

  // Daily spending for last 30 days — build a Map then look up
  const dailySpending = useMemo((): DailyTotal[] => {
    const startStr = nDaysAgoStr(new Date(), 29);
    const dailyMap = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.date >= startStr && tx.date <= today) {
        dailyMap.set(tx.date, (dailyMap.get(tx.date) || 0) + tx.amount);
      }
    }

    const result: DailyTotal[] = [];
    let current = new Date(startStr + 'T00:00:00');
    for (let i = 0; i < 30; i++) {
      const key = format(current, 'yyyy-MM-dd');
      result.push({ date: format(current, 'MMM d'), total: dailyMap.get(key) || 0 });
      current = addDays(current, 1);
    }
    return result;
  }, [transactions, today]);

  // Recent transactions (latest 5)
  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  // Savings rate
  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

  return {
    currentIncome,
    currentExpenses,
    netBalance,
    categoryBreakdown,
    monthlyTotals,
    dailySpending,
    recentTransactions,
    savingsRate,
  };
}
