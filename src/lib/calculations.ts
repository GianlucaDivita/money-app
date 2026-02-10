import { getDaysInMonth, getDate, format, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import type { Transaction, Budget } from '../types';

export function getEffectiveCategories(tx: Transaction): Array<{ categoryId: string; amount: number }> {
  if (tx.splits?.length) return tx.splits.map(s => ({ categoryId: s.categoryId, amount: s.amount }));
  return [{ categoryId: tx.categoryId, amount: tx.amount }];
}

// ===== Fast string-based date helpers =====
// Since tx.date is 'YYYY-MM-DD', string comparison works for range checks
// and is ~50x faster than parseISO + isWithinInterval

export function isInRange(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr;
}

export function monthRangeStrings(date: Date): { start: string; end: string } {
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function todayStr(now: Date = new Date()): string {
  return format(now, 'yyyy-MM-dd');
}

export function nMonthsAgoRange(now: Date, n: number): { start: string; end: string } {
  const d = subMonths(now, n);
  return monthRangeStrings(d);
}

export function nDaysAgoStr(now: Date, n: number): string {
  return format(subDays(now, n), 'yyyy-MM-dd');
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  percentOfMonth: number;
  pacing: 'under' | 'on-track' | 'ahead' | 'over';
  projectedTotal: number;
}

export function calculateBudgetStatus(
  budget: Budget,
  transactions: Transaction[],
  now: Date = new Date()
): BudgetStatus {
  let spent = 0;
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    for (const part of getEffectiveCategories(tx)) {
      if (part.categoryId === budget.categoryId) spent += part.amount;
    }
  }

  const remaining = Math.max(budget.amount - spent, 0);
  const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  // Pacing: how far through the month are we vs how much budget is used
  const dayOfMonth = getDate(now);
  const daysInMonth = getDaysInMonth(now);
  const percentOfMonth = (dayOfMonth / daysInMonth) * 100;

  // Projected total if spending continues at current rate
  const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;
  const projectedTotal = dailyRate * daysInMonth;

  let pacing: BudgetStatus['pacing'];
  if (spent >= budget.amount) {
    pacing = 'over';
  } else if (percentUsed > percentOfMonth + 15) {
    pacing = 'ahead'; // spending faster than pace
  } else if (percentUsed > percentOfMonth - 10) {
    pacing = 'on-track';
  } else {
    pacing = 'under'; // under budget pace — good
  }

  return { budget, spent, remaining, percentUsed, percentOfMonth, pacing, projectedTotal };
}

export function getPacingColor(pacing: BudgetStatus['pacing']): string {
  switch (pacing) {
    case 'under': return 'var(--accent-income)';
    case 'on-track': return 'var(--accent-primary)';
    case 'ahead': return 'var(--accent-warning)';
    case 'over': return 'var(--accent-expense)';
  }
}

export function getPacingLabel(pacing: BudgetStatus['pacing']): string {
  switch (pacing) {
    case 'under': return 'Under budget';
    case 'on-track': return 'On track';
    case 'ahead': return 'Spending fast';
    case 'over': return 'Over budget';
  }
}
